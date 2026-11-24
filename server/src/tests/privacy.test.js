import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';

let parentToken = '';
let studentToken = '';
let teacherToken = '';

before(async () => {
  await connectDB();

  // Log in as Parent (Savita Jadhav, linked to Student 1)
  const parentRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'parent', password: 'password123' });
  assert.equal(parentRes.status, 200);
  parentToken = parentRes.body.token;

  // Log in as Student (Asha Jadhav, linked to Student 1)
  const studentRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'student', password: 'password123' });
  assert.equal(studentRes.status, 200);
  studentToken = studentRes.body.token;

  // Log in as Teacher (S. Deshmukh)
  const teacherRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'teacher', password: 'password123' });
  assert.equal(teacherRes.status, 200);
  teacherToken = teacherRes.body.token;
});

after(async () => {
  await disconnectDB();
});

test('🔒 [PRIVACY] Parent can access their OWN child\'s record (studentId: 1)', async () => {
  const res = await request(app)
    .get('/api/students/1')
    .set('Authorization', `Bearer ${parentToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.numericId, 1);
  assert.equal(res.body.data.fullName, 'Asha Jadhav');
});

test('🔒 [PRIVACY] Parent requesting ANOTHER student\'s record (studentId: 2) MUST return 403 Forbidden', async () => {
  const res = await request(app)
    .get('/api/students/2')
    .set('Authorization', `Bearer ${parentToken}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
  assert.equal(res.body.code, 'STUDENT_DATA_PRIVACY_RESTRICTION');
});

test('🔒 [PRIVACY] Parent requesting another student\'s attendance (/api/students/2/attendance) MUST return 403 Forbidden', async () => {
  const res = await request(app)
    .get('/api/students/2/attendance')
    .set('Authorization', `Bearer ${parentToken}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
  assert.equal(res.body.code, 'STUDENT_DATA_PRIVACY_RESTRICTION');
});

test('🔒 [PRIVACY] Parent requesting another student\'s academic marks (/api/students/2/academic) MUST return 403 Forbidden', async () => {
  const res = await request(app)
    .get('/api/students/2/academic')
    .set('Authorization', `Bearer ${parentToken}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
  assert.equal(res.body.code, 'STUDENT_DATA_PRIVACY_RESTRICTION');
});

test('🔒 [PRIVACY] Parent requesting another student\'s interventions (/api/students/2/interventions) MUST return 403 Forbidden', async () => {
  const res = await request(app)
    .get('/api/students/2/interventions')
    .set('Authorization', `Bearer ${parentToken}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
  assert.equal(res.body.code, 'STUDENT_DATA_PRIVACY_RESTRICTION');
});

test('🔒 [PRIVACY] Student requesting ANOTHER student\'s record (studentId: 3) MUST return 403 Forbidden', async () => {
  const res = await request(app)
    .get('/api/students/3')
    .set('Authorization', `Bearer ${studentToken}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
  assert.equal(res.body.code, 'STUDENT_DATA_PRIVACY_RESTRICTION');
});

test('🔒 [PRIVACY] Parent GET /api/students returns ONLY their linked student record', async () => {
  const res = await request(app)
    .get('/api/students')
    .set('Authorization', `Bearer ${parentToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.count, 1);
  assert.equal(res.body.data.length, 1);
  assert.equal(res.body.data[0].numericId, 1);
  assert.equal(res.body.isScoped, true);
});

test('🔒 [PRIVACY] Parent GET /api/risk/assessments returns ONLY their child\'s assessment', async () => {
  const res = await request(app)
    .get('/api/risk/assessments')
    .set('Authorization', `Bearer ${parentToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.assessments.length, 1);
  assert.equal(res.body.assessments[0].studentId, 1);
  assert.equal(res.body.isScoped, true);
});

test('🔒 [PRIVACY] Parent attempting to mark roll call POST /api/attendance MUST return 403 Forbidden', async () => {
  const res = await request(app)
    .post('/api/attendance')
    .set('Authorization', `Bearer ${parentToken}`)
    .send({
      studentId: 1,
      attendanceDate: '2026-11-22',
      status: 'present'
    });

  assert.equal(res.status, 403);
  assert.equal(res.body.code, 'ROLE_FORBIDDEN');
});

test('🔒 [PRIVACY] Teacher (Staff) can access full student list and all records', async () => {
  const res = await request(app)
    .get('/api/students')
    .set('Authorization', `Bearer ${teacherToken}`);

  assert.equal(res.status, 200);
  assert.ok(res.body.count >= 3);
  assert.equal(res.body.isScoped, false);
});
