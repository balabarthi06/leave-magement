import { Router } from 'express';
import { login, register, getMe, getDemoToken } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/demo-token', getDemoToken);
router.get('/me', authenticateToken, getMe);

export default router;
