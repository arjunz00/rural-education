import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { LearningResource } from '../models/LearningResource.js';

let teacherToken = '';
let testAudioResourceId = '';
let testAudioResource = null;

before(async () => {
  await connectDB();

  // Login as teacher
  const teacherRes = await request(app)
    .post('/api/auth/login')
    .send({ username: 'teacher', password: 'password123' });
  assert.equal(teacherRes.status, 200);
  teacherToken = teacherRes.body.token;

  // Find or create an audio resource
  testAudioResource = await LearningResource.findOne({ resourceType: 'audio' });
  if (!testAudioResource) {
    testAudioResource = await LearningResource.create({
      title: 'Alphabet Phonics & Animal Sounds Test',
      classLevel: 1,
      className: '1',
      subject: 'English',
      resourceType: 'audio',
      description: 'Letter sounds A to Z with village animal calls.',
      content: 'Phonics Guide: Letter A sounds like ant, letter B sounds like bullock.',
      downloadSize: '45 KB',
      duration: '3 min',
      durationSeconds: 180
    });
  }
  testAudioResourceId = testAudioResource._id.toString();
});

after(async () => {
  await disconnectDB();
});

test('🎧 [AUDIO STREAM] GET /api/resources/:id/audio returns HTTP 200 with Accept-Ranges and non-empty stream', async () => {
  const res = await request(app)
    .get(`/api/resources/${testAudioResourceId}/audio`)
    .buffer()
    .parse((res, callback) => {
      res.setEncoding('binary');
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => { callback(null, Buffer.from(data, 'binary')); });
    });

  assert.equal(res.status, 200);
  assert.match(res.headers['content-type'], /audio\/(mpeg|wav)/i);
  assert.equal(res.headers['accept-ranges'], 'bytes');
  assert.ok(res.body.length > 1000, `Audio stream byte size (${res.body.length}) must be > 1000 bytes`);
});

test('🎧 [AUDIO SCRUBBING] GET /api/resources/:id/audio with Range header returns HTTP 206 Partial Content', async () => {
  const res = await request(app)
    .get(`/api/resources/${testAudioResourceId}/audio`)
    .set('Range', 'bytes=0-1023')
    .buffer()
    .parse((res, callback) => {
      res.setEncoding('binary');
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => { callback(null, Buffer.from(data, 'binary')); });
    });

  assert.equal(res.status, 206);
  assert.match(res.headers['content-range'], /bytes 0-1023\/\d+/);
  assert.equal(res.headers['content-length'], '1024');
  assert.equal(res.headers['accept-ranges'], 'bytes');
  assert.match(res.headers['content-type'], /audio\/(mpeg|wav)/i);
  assert.equal(res.body.length, 1024);
});

test('⬇️ [AUDIO DOWNLOAD] GET /api/resources/:id/download returns HTTP 200 with attachment header and non-empty stream', async () => {
  const res = await request(app)
    .get(`/api/resources/${testAudioResourceId}/download`)
    .buffer()
    .parse((res, callback) => {
      res.setEncoding('binary');
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => { callback(null, Buffer.from(data, 'binary')); });
    });

  assert.equal(res.status, 200);
  assert.match(res.headers['content-disposition'], /attachment;\s*filename="GramShiksha.*\.mp3"/i);
  assert.match(res.headers['content-type'], /audio\/(mpeg|wav)/i);
  assert.ok(res.body.length > 1000, `Downloaded audio size (${res.body.length}) must be > 1000 bytes`);
});

test('🛡️ [AUDIO RESILIENCE] Non-existent resource ID returns 404 Not Found', async () => {
  const fakeId = '507f1f77bcf86cd799439011';
  const res = await request(app).get(`/api/resources/${fakeId}/audio`);

  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});

test('📚 [AUDIO METADATA] GET /api/resources enriches audio resources with audioUrl and downloadUrl', async () => {
  const res = await request(app)
    .get('/api/resources?format=audio')
    .set('Authorization', `Bearer ${teacherToken}`);

  assert.equal(res.status, 200);
  assert.ok(res.body.data.length > 0);

  const audioItem = res.body.data[0];
  assert.equal(audioItem.resourceType, 'audio');
  assert.ok(audioItem.audioUrl, 'audioUrl must be populated');
  assert.match(audioItem.audioUrl, /\/api\/resources\/.+\/audio/);
  assert.ok(audioItem.downloadUrl, 'downloadUrl must be populated');
  assert.match(audioItem.downloadUrl, /\/api\/resources\/.+\/download/);
});
