import { Router } from 'express';
import {
  getQuizzes,
  getQuizById,
  createQuiz,
  submitQuiz,
  getStudentSubmissions
} from '../controllers/quizController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireStaff } from '../middleware/rbac.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getQuizzes);
router.get('/:id', getQuizById);
router.post('/', requireStaff, createQuiz);
router.post('/:id/submit', submitQuiz);
router.get('/submissions/:studentId', getStudentSubmissions);

export default router;
