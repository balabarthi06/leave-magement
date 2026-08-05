import { Router } from 'express';
import { getUsers, getUserById, updateProfile, changePassword } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

export default router;
