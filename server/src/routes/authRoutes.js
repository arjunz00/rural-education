import { Router } from 'express';
import {
  register,
  login,
  getMe,
  logout,
  getDemoAccounts,
  seedDemoDatabase
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);
router.get('/demo-accounts', getDemoAccounts);
router.get('/seed-demo', seedDemoDatabase);

export default router;
