import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { bandwidthTracker } from './middleware/bandwidthTracker.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import interventionRoutes from './routes/interventionRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import communicationRoutes from './routes/communicationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import whatsappRoutes from './routes/whatsappRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../../client/dist');

const app = express();

// Low-bandwidth & CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rural bandwidth tracker and response optimizer
app.use(bandwidthTracker);

// Public Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    stack: 'MERN',
    version: '1.0.0',
    system: 'Rural Education Remote Monitoring & Early Intervention System',
    timestamp: new Date().toISOString(),
    lowBandwidthReady: true
  });
});

// Mount modular REST API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Catch-all 404 for undefined API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Static public files (audio assets)
const serverPublicPath = path.resolve(__dirname, '../public');
if (fs.existsSync(serverPublicPath)) {
  app.use('/public', express.static(serverPublicPath));
}

// In production, serve the compiled React SPA static assets
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized error handling
app.use(errorHandler);

export default app;
