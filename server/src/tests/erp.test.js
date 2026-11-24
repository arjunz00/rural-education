import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Communication } from '../models/Communication.js';

let teacherClass1Token = '';
let teacherClass8Token = '';
let parentAshaToken = '';
let parentAaravToken = '';
let createdNoticeId = '';

before(async () => {
  await connectDB();

  // 1. Login Teacher Class 1
  const t1Res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'teacher_class1', password: 'password123' });
  assert.equal(t1Res.status, 200);
  teacherClass1Token = t1Res.body.token;

  // 2. Login Teacher Class 8
  const t8Res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'teacher', password: 'password123' });
  assert.equal(t8Res.status, 200);
  teacherClass8Token = t8Res.body.token;

  // 3. Login Parent Asha (Class 8, studentId: 801)
  const pAshaRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'parent_asha', password: 'password123' });
  assert.equal(pAshaRes.status, 200);
  parentAshaToken = pAshaRes.body.token;

  // 4. Login Parent Aarav (Class 1, studentId: 101)
  const pAaravRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'parent_aarav', password: 'password123' });
  assert.equal(pAaravRes.status, 200);
  parentAaravToken = pAaravRes.body.token;
});

after(async () => {
  // Clean up any test communications created
  if (createdNoticeId) {
    await Communication.findByIdAndDelete(createdNoticeId);
  }
  await mongoose.disconnect();
});

test('🏛️ [ERP CLASS TEACHERS] Dedicated Class Teachers have correct assignedClass scope', async () => {
  const meRes1 = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${teacherClass1Token}`);
  assert.equal(meRes1.status, 200);
  assert.equal(meRes1.body.user.role, 'teacher');
  assert.equal(meRes1.body.user.assignedClass, '1');

  const meRes8 = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${teacherClass8Token}`);
  assert.equal(meRes8.status, 200);
  assert.equal(meRes8.body.user.role, 'teacher');
  assert.equal(meRes8.body.user.assignedClass, '8');
});

test('💬 [COMMUNICATION DISPATCH] Teacher can send targeted message to parent of Student 801', async () => {
  const postRes = await request(app)
    .post('/api/communications')
    .set('Authorization', `Bearer ${teacherClass8Token}`)
    .send({
      studentId: 801,
      title: 'Unit Test Revision Notice',
      messageText: 'Please review Mathematics Chapter 2 with Asha tonight.',
      category: 'academic_feedback',
      isUrgent: false
    });

  assert.equal(postRes.status, 201);
  assert.equal(postRes.body.success, true);
  assert.equal(postRes.body.data.studentId, 801);
  assert.equal(postRes.body.data.readStatus, false);
  createdNoticeId = postRes.body.data._id;
});

test('🔒 [COMMUNICATION ZERO-TRUST] Parent can read their own child notices (200 OK)', async () => {
  const getRes = await request(app)
    .get('/api/communications/student/801')
    .set('Authorization', `Bearer ${parentAshaToken}`);

  assert.equal(getRes.status, 200);
  assert.equal(getRes.body.success, true);
  assert.ok(Array.isArray(getRes.body.data));
  assert.ok(getRes.body.data.length >= 1);
});

test('🛡️ [COMMUNICATION ZERO-TRUST] Parent accessing another child notices MUST return 403 Forbidden', async () => {
  // Parent Asha (child 801) attempts to read Student 101 notices
  const forbiddenRes = await request(app)
    .get('/api/communications/student/101')
    .set('Authorization', `Bearer ${parentAshaToken}`);

  assert.equal(forbiddenRes.status, 403);
  assert.equal(forbiddenRes.body.code, 'FORBIDDEN_STUDENT_SCOPE');
});

test('✓ [NOTICE ACKNOWLEDGEMENT] Parent can mark communication notice as read', async () => {
  assert.ok(createdNoticeId, 'Notice ID must exist from previous test');

  const patchRes = await request(app)
    .patch(`/api/communications/${createdNoticeId}/read`)
    .set('Authorization', `Bearer ${parentAshaToken}`);

  assert.equal(patchRes.status, 200);
  assert.equal(patchRes.body.success, true);
  assert.equal(patchRes.body.data.readStatus, true);
  assert.ok(patchRes.body.data.readAt);
});

test('📢 [CLASS BROADCAST] Teacher can broadcast notice to all students in Class 8', async () => {
  const bcastRes = await request(app)
    .post('/api/communications/broadcast-class')
    .set('Authorization', `Bearer ${teacherClass8Token}`)
    .send({
      classLevel: 8,
      title: 'Science Fair Project Submission',
      messageText: 'All Class 8 students must bring their water conservation charts tomorrow.',
      category: 'homework',
      isUrgent: false
    });

  assert.equal(bcastRes.status, 201);
  assert.equal(bcastRes.body.success, true);
  assert.ok(bcastRes.body.count >= 1);
});

test('📖 [MULTIMEDIA TEXTBOOKS] Querying textbooks returns Balbharati curriculum chapters strictly for requested class', async () => {
  const res8 = await request(app)
    .get('/api/resources?resourceType=textbook&classLevel=8')
    .set('Authorization', `Bearer ${parentAshaToken}`);

  assert.equal(res8.status, 200);
  assert.equal(res8.body.success, true);
  assert.ok(res8.body.data.length >= 1);

  // Verify all returned resources are textbooks and for Class 8
  res8.body.data.forEach(r => {
    assert.equal(r.resourceType, 'textbook');
    assert.equal(r.classLevel, 8);
    assert.ok(r.content && r.content.length > 50);
  });
});
