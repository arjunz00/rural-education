import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import { WhatsAppLog } from '../models/WhatsAppLog.js';
import { Attendance } from '../models/Attendance.js';
import { Student } from '../models/Student.js';

let headmasterToken = '';
let teacherClass8Token = '';
let parentAshaToken = '';
let parentRohanToken = '';
const testDate = '2026-11-25';

before(async () => {
  await connectDB();

  // 1. Headmaster login
  const hmRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'headmaster', password: 'password123' });
  assert.equal(hmRes.status, 200);
  headmasterToken = hmRes.body.token;

  // 2. Class 8 Teacher login
  const t8Res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'teacher', password: 'password123' });
  assert.equal(t8Res.status, 200);
  teacherClass8Token = t8Res.body.token;

  // 3. Parent Asha (Class 8, student #801)
  const pAshaRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'parent_asha', password: 'password123' });
  assert.equal(pAshaRes.status, 200);
  parentAshaToken = pAshaRes.body.token;

  // 4. Parent Rohan (Class 7, student #701)
  const pRohanRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'parent_rohan', password: 'password123' });
  assert.equal(pRohanRes.status, 200);
  parentRohanToken = pRohanRes.body.token;
});

after(async () => {
  // Clean up any test WhatsApp logs created during test
  await WhatsAppLog.deleteMany({ studentId: { $in: [801, 701] } });
  await mongoose.disconnect();
});

test('💬 [WHATSAPP DISPATCH] Daily morning absence alert creates log and returns valid wa.me link', async () => {
  const res = await request(app)
    .post('/api/whatsapp/send')
    .set('Authorization', `Bearer ${teacherClass8Token}`)
    .send({
      studentId: 801,
      templateType: 'daily_absence',
      customNotes: 'Morning fever reported'
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data);
  assert.equal(res.body.data.studentId, 801);
  assert.equal(res.body.data.templateType, 'daily_absence');
  assert.ok(['sent', 'delivered'].includes(res.body.data.deliveryStatus));
  assert.ok(res.body.clickToChatUrl);
  assert.ok(res.body.clickToChatUrl.startsWith('https://wa.me/91'));
  assert.ok(res.body.clickToChatUrl.includes('ABSENT'));
});

test('🚨 [WHATSAPP EARLY WARNING] 3+ Consecutive absence critical drop warning message', async () => {
  const res = await request(app)
    .post('/api/whatsapp/send')
    .set('Authorization', `Bearer ${headmasterToken}`)
    .send({
      studentId: 801,
      templateType: 'consecutive_absence_alert',
      consecutiveDays: 4
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.messageBody.includes('URGENT ATTENDANCE ALERT'));
  assert.ok(res.body.data.messageBody.includes('4 consecutive school days'));
  assert.ok(res.body.data.triggeredBy);
});

test('📊 [WHATSAPP MARKSHEET SUMMARY] Formats dynamic academic summary with subjects & percentage', async () => {
  const res = await request(app)
    .post('/api/whatsapp/send')
    .set('Authorization', `Bearer ${teacherClass8Token}`)
    .send({
      studentId: 801,
      templateType: 'marksheet_summary'
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.messageBody.includes('GramShiksha Official Marksheet'));
  assert.ok(res.body.data.messageBody.includes('Class 8'));
});

test('📢 [WHATSAPP TEACHER NOTICE] Custom homework & village revision broadcast notice', async () => {
  const customMessage = 'Please ensure completion of Marathi Chapter 4 grammar questions by tomorrow morning.';
  const res = await request(app)
    .post('/api/whatsapp/send')
    .set('Authorization', `Bearer ${teacherClass8Token}`)
    .send({
      studentId: 801,
      templateType: 'teacher_notice',
      customNotes: customMessage
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.messageBody.includes(customMessage));
});

test('🌐 [WHATSAPP CLICK-TO-CHAT URL] Generates direct wa.me link with encoded URI', async () => {
  const res = await request(app)
    .get('/api/whatsapp/link?studentId=801&templateType=daily_absence')
    .set('Authorization', `Bearer ${teacherClass8Token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.clickToChatUrl.startsWith('https://wa.me/91'));
  assert.ok(res.body.recipientPhone.startsWith('91'));
});

test('👥 [WHATSAPP BULK ABSENCE DISPATCH] Scans morning roll call and sends batch alerts', async () => {
  await Attendance.updateOne(
    { studentId: 801, attendanceDate: '2026-11-23' },
    { $set: { status: 'absent' } },
    { upsert: true }
  );

  const res = await request(app)
    .post('/api/whatsapp/bulk-absence-alerts')
    .set('Authorization', `Bearer ${teacherClass8Token}`)
    .send({
      date: '2026-11-23',
      classLevel: 8
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.summary);
  assert.ok(res.body.summary.sentCount >= 1);
  assert.ok(Array.isArray(res.body.results));
});

test('🔒 [ZERO-TRUST PRIVACY] Parent can access only their own child’s WhatsApp log history', async () => {
  // Parent Asha accessing Asha (#801) - Authorized
  const ashaRes = await request(app)
    .get('/api/whatsapp/logs?studentId=801')
    .set('Authorization', `Bearer ${parentAshaToken}`);

  assert.equal(ashaRes.status, 200);
  assert.equal(ashaRes.body.success, true);
  assert.ok(Array.isArray(ashaRes.body.logs));
  assert.ok(ashaRes.body.logs.length >= 1);

  // Parent Asha accessing Rohan (#701) - 403 Forbidden!
  const rohanForbiddenRes = await request(app)
    .get('/api/whatsapp/logs?studentId=701')
    .set('Authorization', `Bearer ${parentAshaToken}`);

  assert.equal(rohanForbiddenRes.status, 403);
  assert.ok(rohanForbiddenRes.body.message.includes('Unauthorized student data access'));
});

test('📈 [WHATSAPP INSTITUTIONAL SUMMARY] Admin/Teacher can fetch aggregated dispatch metrics', async () => {
  const res = await request(app)
    .get('/api/whatsapp/summary')
    .set('Authorization', `Bearer ${headmasterToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(typeof res.body.summary.totalSent === 'number');
  assert.ok(res.body.summary.totalSent >= 1);
  assert.ok(Array.isArray(res.body.recentAlerts));
});
