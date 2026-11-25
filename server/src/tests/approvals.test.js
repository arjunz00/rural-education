import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { LearningResource } from '../models/LearningResource.js';

let headmasterToken = '';
let teacherClass8Token = '';
let parentAshaToken = '';
let newTeacherId = '';
let newTeacherToken = '';
let testStudentId = 0;
let testStudentClass2Id = 0;
let createdResourceId = '';

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

  // 3. Parent Asha login
  const pRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'parent_asha', password: 'password123' });
  assert.equal(pRes.status, 200);
  parentAshaToken = pRes.body.token;
});

after(async () => {
  // Cleanup test teacher, students, and resources
  if (newTeacherId) {
    await User.findByIdAndDelete(newTeacherId);
  }
  if (testStudentId) {
    await Student.deleteOne({ numericId: testStudentId });
  }
  if (testStudentClass2Id) {
    await Student.deleteOne({ numericId: testStudentClass2Id });
  }
  if (createdResourceId) {
    await LearningResource.findByIdAndDelete(createdResourceId);
  }
  await mongoose.disconnect();
});

test('⏳ [TEACHER REGISTRATION] Newly registered teacher starts in pending state and is blocked from login', async () => {
  const regRes = await request(app)
    .post('/api/auth/register')
    .send({
      role: 'teacher',
      fullName: 'Pratibha More',
      username: 'teacher_pratibha',
      email: 'pratibha.more@zp-dahiwadi.edu.in',
      password: 'password123',
      schoolName: 'Zilla Parishad High School, Dahiwadi',
      assignedClass: '7'
    });

  assert.equal(regRes.status, 201);
  assert.equal(regRes.body.user.approvalStatus, 'pending');
  newTeacherId = regRes.body.user.id;

  // Attempting to log in as pending teacher MUST return 403 Forbidden
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'teacher_pratibha',
      password: 'password123'
    });

  assert.equal(loginRes.status, 403);
  assert.equal(loginRes.body.code, 'TEACHER_APPROVAL_PENDING');
  assert.ok(loginRes.body.error.includes('awaiting verification by Principal'));
});

test('🏛️ [HEADMASTER APPROVAL] Headmaster views pending teachers and approves teacher account', async () => {
  // 1. Headmaster fetches pending teachers
  const pendingRes = await request(app)
    .get('/api/admin/pending-teachers')
    .set('Authorization', `Bearer ${headmasterToken}`);

  assert.equal(pendingRes.status, 200);
  assert.ok(Array.isArray(pendingRes.body.data));
  const found = pendingRes.body.data.find(t => t.username === 'teacher_pratibha');
  assert.ok(found, 'Pending teacher must appear in Principal review queue');

  // 2. Headmaster approves teacher
  const approveRes = await request(app)
    .patch(`/api/admin/teachers/${newTeacherId}/approve`)
    .set('Authorization', `Bearer ${headmasterToken}`);

  assert.equal(approveRes.status, 200);
  assert.equal(approveRes.body.data.approvalStatus, 'approved');
  assert.ok(approveRes.body.data.approvedBy);

  // 3. Now the approved teacher CAN log in successfully
  const approvedLoginRes = await request(app)
    .post('/api/auth/login')
    .send({
      username: 'teacher_pratibha',
      password: 'password123'
    });

  assert.equal(approvedLoginRes.status, 200);
  assert.equal(approvedLoginRes.body.user.approvalStatus, 'approved');
  newTeacherToken = approvedLoginRes.body.token;
});

test('👨‍🏫 [STUDENT ENROLLMENT SCOPE] Class 8 Teacher verifies Class 8 student, but cannot verify Class 2 student', async () => {
  // 1. Create a pending student for Class 8
  const highestStudent = await Student.findOne().sort({ numericId: -1 });
  testStudentId = (highestStudent ? highestStudent.numericId : 1000) + 99;
  testStudentClass2Id = testStudentId + 1;

  await Student.create({
    numericId: testStudentId,
    fullName: 'Omkar Jadhav',
    className: '8',
    schoolName: 'Zilla Parishad High School, Dahiwadi',
    parentName: 'Tanaji Jadhav',
    parentContact: '+91 94220 55667',
    enrollmentStatus: 'pending',
    hamletOrWadi: 'Jadhav Wasti'
  });

  // 2. Create a pending student for Class 2
  await Student.create({
    numericId: testStudentClass2Id,
    fullName: 'Shreya Gaikwad',
    className: '2',
    schoolName: 'Zilla Parishad Primary Wing',
    parentName: 'Vikas Gaikwad',
    parentContact: '+91 94220 55668',
    enrollmentStatus: 'pending',
    hamletOrWadi: 'Gaikwad Wasti'
  });

  // 3. Class 8 Teacher fetches pending students (scoped to Class 8)
  const pendingRes = await request(app)
    .get('/api/teacher/pending-students')
    .set('Authorization', `Bearer ${teacherClass8Token}`);

  assert.equal(pendingRes.status, 200);
  assert.ok(pendingRes.body.data.some(s => s.numericId === testStudentId));
  // Class 8 teacher should not see Class 2 student in their scoped list
  assert.ok(!pendingRes.body.data.some(s => s.numericId === testStudentClass2Id));

  // 4. Class 8 Teacher successfully approves Class 8 student
  const appRes = await request(app)
    .patch(`/api/teacher/students/${testStudentId}/approve`)
    .set('Authorization', `Bearer ${teacherClass8Token}`);

  assert.equal(appRes.status, 200);
  assert.equal(appRes.body.data.enrollmentStatus, 'enrolled');

  // 5. Class 8 Teacher attempting to approve Class 2 student MUST return 403 Forbidden
  const mismatchRes = await request(app)
    .patch(`/api/teacher/students/${testStudentClass2Id}/approve`)
    .set('Authorization', `Bearer ${teacherClass8Token}`);

  assert.equal(mismatchRes.status, 403);
  assert.equal(mismatchRes.body.code, 'TEACHER_CLASS_MISMATCH');
});

test('📚 [TEACHER RESOURCE AUTHORING] Teacher can publish learning resource and delete it', async () => {
  // 1. Teacher creates a resource for Class 8
  const createRes = await request(app)
    .post('/api/resources')
    .set('Authorization', `Bearer ${teacherClass8Token}`)
    .send({
      title: 'Linear Equations in One Variable (Formulas & Practice)',
      classLevel: 8,
      subject: 'Mathematics',
      resourceType: 'notes',
      description: 'Quick revision formula cheat-sheet for Class 8 unit evaluation.',
      content: 'Standard form: ax + b = c. Transposition rule: change sign when moving terms across =.'
    });

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.success, true);
  assert.equal(createRes.body.data.classLevel, 8);
  assert.ok(createRes.body.data.uploadedByTeacherName);
  createdResourceId = createRes.body.data._id;

  // 2. Parent of Class 8 accesses the new resource
  const getRes = await request(app)
    .get('/api/resources?classLevel=8')
    .set('Authorization', `Bearer ${parentAshaToken}`);

  assert.equal(getRes.status, 200);
  assert.ok(getRes.body.data.some(r => r._id === createdResourceId));

  // 3. Teacher deletes the resource
  const delRes = await request(app)
    .delete(`/api/resources/${createdResourceId}`)
    .set('Authorization', `Bearer ${teacherClass8Token}`);

  assert.equal(delRes.status, 200);
  assert.equal(delRes.body.success, true);
});

test('🛡️ [UNAUTHORIZED PREVENTED] Parents and Students cannot call institutional approval endpoints', async () => {
  // Parent attempts to call Principal's pending teachers route
  const noAdminRes = await request(app)
    .get('/api/admin/pending-teachers')
    .set('Authorization', `Bearer ${parentAshaToken}`);

  assert.equal(noAdminRes.status, 403);

  // Parent attempts to call Teacher's student approval route
  const noTeacherRes = await request(app)
    .patch(`/api/teacher/students/${testStudentClass2Id}/approve`)
    .set('Authorization', `Bearer ${parentAshaToken}`);

  assert.equal(noTeacherRes.status, 403);
});
