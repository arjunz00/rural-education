import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { bandwidthTracker } from './middleware/bandwidthTracker.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import academicRoutes from './routes/academicRoutes.js';
import interventionRoutes from './routes/interventionRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';

dotenv.config();

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

// Catch-all 404 for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling
app.use(errorHandler);

export default app;
