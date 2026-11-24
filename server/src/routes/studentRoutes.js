import { Router } from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent
} from '../controllers/studentController.js';
import { getStudentAttendance } from '../controllers/attendanceController.js';
import { getStudentAcademic } from '../controllers/academicController.js';
import { getStudentInterventions } from '../controllers/interventionController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireStaff, authorizeStudentScope } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getStudents);
router.post('/', requireStaff, createStudent);

// Student detail and scoped sub-resources (enforce privacy boundaries)
router.get('/:id', authorizeStudentScope, getStudentById);
router.patch('/:id', requireStaff, updateStudent);

router.get('/:id/attendance', authorizeStudentScope, getStudentAttendance);
router.get('/:id/academic', authorizeStudentScope, getStudentAcademic);
router.get('/:id/interventions', authorizeStudentScope, getStudentInterventions);

export default router;
