import { Router } from 'express';
import { getNotifications, createNotification, markRead, markAllRead, getUnreadCount } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.post('/', createNotification);
router.put('/read-all', markAllRead);
router.put('/:id/read', markRead);

export default router;
