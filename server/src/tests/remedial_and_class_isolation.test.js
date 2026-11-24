import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';

let teacherToken = '';
let parentAshaToken = '';
let studentRahulToken = '';

before(async () => {
  await connectDB();

  // 1. Teacher login
  const teacherRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'teacher', password: 'password123' });
  assert.equal(teacherRes.status, 200);
  teacherToken = teacherRes.body.token;

  // 2. Parent of Asha login (parent_asha, linked to student #801)
  const parentRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'parent_asha', password: 'password123' });
  assert.equal(parentRes.status, 200);
  parentAshaToken = parentRes.body.token;

  // 3. Student Rahul login (student_rahul, linked to student #501, struggling with math)
  const studentRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'student_rahul', password: 'password123' });
  assert.equal(studentRes.status, 200);
  studentRahulToken = studentRes.body.token;
});

after(async () => {
  await disconnectDB();
});

test('📚 [CLASS ISOLATION] GET /api/resources?classLevel=5 returns ONLY Class 5 resources (0 items from Class 8)', async () => {
  const res = await request(app)
    .get('/api/resources?classLevel=5')
    .set('Authorization', `Bearer ${teacherToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.length > 0, 'Class 5 resources must exist');

  // Verify strict isolation: every single item must be classLevel 5
  res.body.data.forEach((r) => {
    assert.equal(Number(r.classLevel), 5, `Expected resource ${r.title} to belong to Class 5`);
  });

  // Verify zero items from Class 8
  const class8Items = res.body.data.filter(r => Number(r.classLevel) === 8);
  assert.equal(class8Items.length, 0, 'Must have zero items from Class 8');
});

test('📚 [CLASS ISOLATION] GET /api/resources?classLevel=8 returns ONLY Class 8 resources (0 items from Class 5)', async () => {
  const res = await request(app)
    .get('/api/resources?classLevel=8')
    .set('Authorization', `Bearer ${teacherToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.data.length > 0, 'Class 8 resources must exist');

  // Verify strict isolation: every single item must be classLevel 8
  res.body.data.forEach((r) => {
    assert.equal(Number(r.classLevel), 8, `Expected resource ${r.title} to belong to Class 8`);
  });

  // Verify zero items from Class 5
  const class5Items = res.body.data.filter(r => Number(r.classLevel) === 5);
  assert.equal(class5Items.length, 0, 'Must have zero items from Class 5');
});

test('🔒 [1-to-1 PRIVACY] Parent of Asha (parent_asha) accessing /api/students/801 returns 200 OK', async () => {
  const res = await request(app)
    .get('/api/students/801')
    .set('Authorization', `Bearer ${parentAshaToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.numericId, 801);
  assert.equal(res.body.data.fullName, 'Asha Jadhav');
});

test('🔒 [1-to-1 PRIVACY] Parent of Asha (parent_asha) accessing /api/students/501 returns 403 Forbidden', async () => {
  const res = await request(app)
    .get('/api/students/501')
    .set('Authorization', `Bearer ${parentAshaToken}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
  assert.equal(res.body.code, 'STUDENT_DATA_PRIVACY_RESTRICTION');
});

test('🎯 [REMEDIAL QUIZ] Struggling student can fetch assigned quiz and successfully submit answers with score persisted', async () => {
  // A. Fetch quizzes for Rahul Pawar (#501, Class 5)
  const quizListRes = await request(app)
    .get('/api/quizzes?classLevel=5&studentId=501')
    .set('Authorization', `Bearer ${studentRahulToken}`);

  assert.equal(quizListRes.status, 200);
  assert.equal(quizListRes.body.success, true);
  assert.ok(quizListRes.body.data.length >= 1, 'Should find at least 1 assigned remedial quiz');

  const quiz = quizListRes.body.data.find(q => q.assignedStudentIds.includes(501));
  assert.ok(quiz, 'Assigned quiz for student 501 must be present');
  assert.equal(quiz.classLevel, 5);
  assert.ok(quiz.questions.length >= 3, 'Must have at least 3 questions');

  // B. Submit answers
  const answers = [
    { questionIndex: 0, selectedOptionIndex: quiz.questions[0].correctOptionIndex },
    { questionIndex: 1, selectedOptionIndex: quiz.questions[1].correctOptionIndex },
    { questionIndex: 2, selectedOptionIndex: quiz.questions[2].correctOptionIndex }
  ];

  const submitRes = await request(app)
    .post(`/api/quizzes/${quiz._id}/submit`)
    .set('Authorization', `Bearer ${studentRahulToken}`)
    .send({
      studentId: 501,
      answers
    });

  assert.equal(submitRes.status, 200);
  assert.equal(submitRes.body.success, true);
  assert.equal(submitRes.body.score, 3);
  assert.equal(submitRes.body.totalQuestions, 3);
  assert.equal(submitRes.body.percentage, 100);
  assert.equal(submitRes.body.status, 'passed');

  // C. Verify score persisted in submission history
  const historyRes = await request(app)
    .get('/api/quizzes/submissions/501')
    .set('Authorization', `Bearer ${studentRahulToken}`);

  assert.equal(historyRes.status, 200);
  assert.equal(historyRes.body.success, true);
  assert.ok(historyRes.body.data.length >= 1, 'Submission history must record the attempt');
  assert.equal(historyRes.body.data[0].score, 3);
  assert.equal(historyRes.body.data[0].status, 'passed');

  // D. Privacy check: parent_asha attempting to view Rahul's submissions (501) must return 403 Forbidden!
  const privacyCheck = await request(app)
    .get('/api/quizzes/submissions/501')
    .set('Authorization', `Bearer ${parentAshaToken}`);

  assert.equal(privacyCheck.status, 403);
  assert.equal(privacyCheck.body.success, false);
});
