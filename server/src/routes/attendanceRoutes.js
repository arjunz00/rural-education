import { Router } from 'express';
import {
  getAttendance,
  getAttendanceSummary,
  getAttendanceAnalytics,
  recordAttendance,
  bulkAttendance
} from '../controllers/attendanceController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireStaff, authorizeStudentScope } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateToken);

router.get('/summary', requireStaff, getAttendanceSummary);
router.get('/analytics', authorizeStudentScope, getAttendanceAnalytics);
router.get('/', authorizeStudentScope, getAttendance);

router.post('/', requireStaff, recordAttendance);
router.post('/bulk', requireStaff, bulkAttendance);

export default router;
