import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';

let teacherToken = '';
let headmasterToken = '';

before(async () => {
  await connectDB();

  const teacherRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'teacher', password: 'password123' });
  teacherToken = teacherRes.body.token;

  const hmRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'headmaster', password: 'password123' });
  headmasterToken = hmRes.body.token;
});

after(async () => {
  await disconnectDB();
});

test('⚡ [HEALTH] GET /api/health returns status ok and stack MERN', async () => {
  const res = await request(app).get('/api/health');

  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.stack, 'MERN');
  assert.equal(res.body.lowBandwidthReady, true);
  assert.equal(res.headers['x-low-bandwidth-ready'], 'true');
});

test('⚡ [AUTH] Invalid login returns 401 Unauthorized', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: 'teacher', password: 'wrongpassword' });

  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('⚡ [AUTH] Protected route without token returns 401', async () => {
  const res = await request(app).get('/api/auth/me');

  assert.equal(res.status, 401);
  assert.equal(res.body.code, 'AUTH_TOKEN_MISSING');
});

test('⚡ [AUTH] GET /api/auth/me with valid token returns current profile', async () => {
  const res = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${teacherToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.user.username, 'teacher');
  assert.equal(res.body.user.role, 'teacher');
});

test('⚡ [RISK ENGINE] Accurately detects High Risk and Critical Alert for Rohan Pawar (#2)', async () => {
  const res = await request(app)
    .get('/api/risk/assessments')
    .set('Authorization', `Bearer ${teacherToken}`);

  assert.equal(res.status, 200);
  assert.ok(res.body.assessments.length >= 3);

  const rohanAssessment = res.body.assessments.find(a => a.studentId === 2);
  assert.ok(rohanAssessment, 'Rohan Pawar assessment should exist');
  assert.equal(rohanAssessment.riskLevel, 'High');
  assert.equal(rohanAssessment.hasCriticalAlert, true);
  assert.ok(rohanAssessment.consecutiveAbsent >= 3);
});

test('⚡ [ATTENDANCE] Teacher can submit bulk daily roll call', async () => {
  const testDate = '2026-11-23';
  const res = await request(app)
    .post('/api/attendance/bulk')
    .set('Authorization', `Bearer ${teacherToken}`)
    .send({
      attendanceDate: testDate,
      records: [
        { studentId: 1, status: 'present', notes: 'Active in class' },
        { studentId: 2, status: 'absent', notes: 'Family field work' },
        { studentId: 3, status: 'present', notes: '' }
      ]
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
});

test('⚡ [ATTENDANCE SUMMARY] Headmaster can view school-wide attendance summary', async () => {
  const res = await request(app)
    .get('/api/attendance/summary')
    .set('Authorization', `Bearer ${headmasterToken}`);

  assert.equal(res.status, 200);
  assert.ok(res.body.summary.totalRecords > 0);
  assert.ok(res.body.summary.classBreakdown.length > 0);
});

test('⚡ [ACADEMIC] Teacher can view subject averages across school', async () => {
  const res = await request(app)
    .get('/api/academic/summary')
    .set('Authorization', `Bearer ${teacherToken}`);

  assert.equal(res.status, 200);
  assert.ok(res.body.summary.subjectAverages.length > 0);
});
