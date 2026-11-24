import { Router } from 'express';
import { getRiskAssessments } from '../controllers/riskController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeStudentScope } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateToken);

// Scoped for Parent and Student to their child's risk status only
router.get('/assessments', authorizeStudentScope, getRiskAssessments);

export default router;
