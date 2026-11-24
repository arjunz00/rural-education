import { Router } from 'express';
import { getResources, createResource } from '../controllers/resourceController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireStaff } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getResources);
router.post('/', requireStaff, createResource);

export default router;
