import { Router } from 'express';
import {
  getInterventions,
  createIntervention,
  updateIntervention
} from '../controllers/interventionController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireStaff, authorizeStudentScope } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateToken);

router.get('/', authorizeStudentScope, getInterventions);
router.post('/', requireStaff, createIntervention);
router.patch('/:id', requireStaff, updateIntervention);

export default router;
