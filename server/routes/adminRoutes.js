import { Router } from 'express';
import { getAdminDashboard, updateAdminLeaveRequest } from '../controllers/adminController.js';
import { getLeaveRequests } from '../controllers/leaveController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/dashboard', getAdminDashboard);
router.get('/leave-requests', getLeaveRequests);
router.put('/leave-requests/:id', updateAdminLeaveRequest);

export default router;
