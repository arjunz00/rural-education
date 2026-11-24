import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';

let teacherToken = '';
let newlyRegisteredParentToken = '';
let newlyCreatedStudentId = null;

before(async () => {
  await connectDB();

  // Login as existing teacher to query resources and check baseline
  const teacherRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'teacher', password: 'password123' });
  assert.equal(teacherRes.status, 200);
  teacherToken = teacherRes.body.token;
});

after(async () => {
  await disconnectDB();
});

test('✨ [REGISTRATION] test_register_teacher: Successfully registers teacher with assigned class', async () => {
  const timestamp = Date.now();
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      role: 'teacher',
      fullName: 'Anita Salunkhe',
      username: `teacher_${timestamp}`,
      email: `anita_${timestamp}@school.edu.in`,
      password: 'password123',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      assignedClass: '7'
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.ok(res.body.token, 'Should issue a valid JWT token');
  assert.equal(res.body.user.role, 'teacher');
  assert.equal(res.body.user.assignedClass, '7');
});

test('✨ [REGISTRATION] test_register_parent_and_child: Automatically provisions student record and links studentId', async () => {
  const timestamp = Date.now();
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      role: 'parent',
      fullName: 'Kavita Shinde',
      username: `parent_${timestamp}`,
      email: `kavita_${timestamp}@circle4.gov.in`,
      password: 'password123',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      className: '8',
      childName: `Meena Shinde ${timestamp}`,
      parentContact: '9876543210'
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.ok(res.body.token, 'Should issue token');
  assert.equal(res.body.user.role, 'parent');
  assert.ok(res.body.user.studentId, 'Must have auto-generated studentId');
  assert.ok(typeof res.body.user.studentId === 'number');

  newlyRegisteredParentToken = res.body.token;
  newlyCreatedStudentId = res.body.user.studentId;
});

test('✨ [REGISTRATION] test_duplicate_registration_rejected: Duplicate username or email rejected with 400', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      role: 'teacher',
      fullName: 'Duplicate Teacher',
      username: 'teacher', // Existing seeded username
      email: 'unique_new_email@school.edu.in',
      password: 'password123',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      assignedClass: '8'
    });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.error, /already taken|already registered/i);
});

test('📚 [RESOURCES] test_class_filtered_resources: GET /api/resources?class=8 filters correctly', async () => {
  const res = await request(app)
    .get('/api/resources?class=8')
    .set('Authorization', `Bearer ${teacherToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length > 0);

  // Every returned resource must either belong to class 8 or 'all'
  res.body.data.forEach((r) => {
    assert.ok(
      String(r.classLevel) === '8' || String(r.classLevel) === 'all' || r.className === '8',
      `Resource ${r.title} should be Class 8 or all, got: ${r.classLevel}`
    );
  });
});

test('🔒 [PRIVACY] test_privacy_maintained_for_new_registrations: Newly registered parent gets 403 on others records', async () => {
  assert.ok(newlyRegisteredParentToken, 'Parent token must be available from prior step');
  assert.ok(newlyCreatedStudentId, 'Student ID must be available');

  // A. Access own child's record -> 200 OK
  const ownRes = await request(app)
    .get(`/api/students/${newlyCreatedStudentId}`)
    .set('Authorization', `Bearer ${newlyRegisteredParentToken}`);
  assert.equal(ownRes.status, 200);
  assert.equal(ownRes.body.data.numericId, newlyCreatedStudentId);

  // B. Attempt to access student #1 (Asha Jadhav) -> 403 Forbidden!
  const otherRes = await request(app)
    .get('/api/students/1')
    .set('Authorization', `Bearer ${newlyRegisteredParentToken}`);
  assert.equal(otherRes.status, 403);
  assert.equal(otherRes.body.success, false);
});
