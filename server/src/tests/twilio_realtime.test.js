import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import http from 'http';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import { initSocket, getIO, broadcastToStudent, broadcastToClass, broadcastToAll } from '../socket.js';
import { Communication } from '../models/Communication.js';
import { WhatsAppLog } from '../models/WhatsAppLog.js';
import { Student } from '../models/Student.js';

let teacherToken = '';
let httpServer = null;
const testMessageSid = `SM-TEST-TWILIO-${Date.now()}`;

before(async () => {
  await connectDB();

  // Initialize socket on an HTTP server for test validation
  httpServer = http.createServer(app);
  initSocket(httpServer);

  // Authenticate as Teacher
  const tRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'teacher', password: 'password123' });
  assert.equal(tRes.status, 200);
  teacherToken = tRes.body.token;
});

after(async () => {
  // Clean up test records
  await Communication.deleteMany({ title: { $regex: /Inbound Mobile Message|Parent Update|Simulated/ } });
  await WhatsAppLog.deleteMany({ providerMessageId: { $regex: /SM-TEST|SM-SIMULATED|INBOUND/ } });
  if (httpServer) {
    httpServer.close();
  }
  await mongoose.disconnect();
});

test('⚡ [SOCKET.IO ENGINE] Socket.IO initializes cleanly and provides room broadcast helpers', () => {
  const io = getIO();
  assert.ok(io, 'Socket.IO instance should be initialized');

  // Verify helpers execute without error
  assert.doesNotThrow(() => {
    broadcastToStudent(801, 'test_event', { status: 'ok' });
    broadcastToClass(8, 'test_event', { status: 'ok' });
    broadcastToAll('test_event', { status: 'ok' });
  });
});

test('🔧 [TWILIO CONFIG] GET /api/twilio/config returns active provider and real-time status', async () => {
  const res = await request(app)
    .get('/api/twilio/config')
    .set('Authorization', `Bearer ${teacherToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.provider);
  assert.equal(res.body.realtimeSocketEnabled, true);
});

test('📱 [TWILIO INBOUND WEBHOOK] Inbound mobile webhook creates Communication & WhatsAppLog and responds with TwiML', async () => {
  const sampleBody = 'Namaste Guruji, Asha had fever this morning so could not attend class.';

  const res = await request(app)
    .post('/api/twilio/webhook')
    .send({
      From: '+919822144801',
      To: '+14155238886',
      Body: sampleBody,
      MessageSid: testMessageSid
    });

  assert.equal(res.status, 200);
  assert.ok(res.headers['content-type'].includes('xml'));
  assert.ok(res.text.includes('<Response>'));
  assert.ok(res.text.includes('<Message>'));

  // Verify created in Communication collection
  const comm = await Communication.findOne({
    studentId: 801,
    category: 'parent_reply'
  }).sort({ createdAt: -1 });

  assert.ok(comm);
  assert.equal(comm.messageText, sampleBody);
  assert.equal(comm.senderRole, 'parent');
  assert.ok(comm.isUrgent); // Fever triggers urgent flag

  // Verify created in WhatsAppLog
  const wa = await WhatsAppLog.findOne({
    providerMessageId: testMessageSid
  });
  assert.ok(wa);
  assert.equal(wa.studentId, 801);
  assert.equal(wa.deliveryStatus, 'delivered');
});

test('📊 [TWILIO STATUS CALLBACK] Delivery updates status in WhatsApp audit ledger', async () => {
  const res = await request(app)
    .post('/api/twilio/status-callback')
    .send({
      MessageSid: testMessageSid,
      MessageStatus: 'delivered',
      To: '+919822144801'
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.status, 'delivered');
});

test('🧪 [TWILIO INBOUND SIMULATION] Staff can trigger inbound reply for real-time testing', async () => {
  const res = await request(app)
    .post('/api/twilio/simulate-inbound')
    .set('Authorization', `Bearer ${teacherToken}`)
    .send({
      studentId: 801,
      messageText: 'Simulated parent reply: Child has completed all revision questions.'
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.student);
  assert.equal(res.body.data.student.numericId, 801);
  assert.ok(res.body.data.communication);
});

test('📤 [TWILIO SMS DISPATCH] Staff can dispatch fallback SMS message', async () => {
  const res = await request(app)
    .post('/api/twilio/send-sms')
    .set('Authorization', `Bearer ${teacherToken}`)
    .send({
      studentId: 801,
      messageBody: 'GramShiksha Alert: Please verify your child homework packet for Class 8.'
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.result);
  assert.equal(res.body.result.deliveryStatus, 'sent');
});
