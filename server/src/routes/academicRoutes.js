import { Router } from 'express';
import {
  getRecords,
  getAcademicSummary,
  createRecord,
  updateRecord,
  deleteRecord
} from '../controllers/academicController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireStaff, authorizeStudentScope } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateToken);

router.get('/summary', requireStaff, getAcademicSummary);
router.get('/records', authorizeStudentScope, getRecords);
router.post('/records', requireStaff, createRecord);
router.patch('/records/:id', requireStaff, updateRecord);
router.delete('/records/:id', requireStaff, deleteRecord);

export default router;
