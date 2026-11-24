import { Router } from 'express';
import {
  sendMessage,
  broadcastToClass,
  getStudentCommunications,
  markAsRead,
  getUnreadCount
} from '../controllers/communicationController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireStaff } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateToken);

router.post('/', requireStaff, sendMessage);
router.post('/broadcast-class', requireStaff, broadcastToClass);
router.get('/student/:studentId', getStudentCommunications);
router.patch('/:id/read', markAsRead);
router.get('/unread-count/:studentId', getUnreadCount);

export default router;
