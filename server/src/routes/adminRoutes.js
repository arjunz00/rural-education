import { Router } from 'express';
import {
  getPendingTeachers,
  approveTeacher,
  rejectTeacher
} from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireHeadmasterOrAdmin } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateToken);
router.use(requireHeadmasterOrAdmin);

router.get('/pending-teachers', getPendingTeachers);
router.patch('/teachers/:id/approve', approveTeacher);
router.patch('/teachers/:id/reject', rejectTeacher);

export default router;
