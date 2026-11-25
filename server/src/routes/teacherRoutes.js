import { Router } from 'express';
import {
  getPendingStudents,
  approveStudent,
  rejectStudent
} from '../controllers/teacherController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireStaff } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateToken);
router.use(requireStaff);

router.get('/pending-students', getPendingStudents);
router.patch('/students/:id/approve', approveStudent);
router.patch('/students/:id/reject', rejectStudent);

export default router;
