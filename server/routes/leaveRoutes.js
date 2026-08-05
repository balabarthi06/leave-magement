import { Router } from 'express';
import {
  getLeaveRequests,
  getMyLeaveRequests,
  getLeaveRequestById,
  createLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  cancelLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest
} from '../controllers/leaveController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getLeaveRequests);
router.get('/my', getMyLeaveRequests);
router.get('/:id', getLeaveRequestById);
router.post('/', createLeaveRequest);
router.put('/:id', updateLeaveRequest);
router.delete('/:id', deleteLeaveRequest);
router.put('/:id/cancel', cancelLeaveRequest);
router.post('/:id/cancel', cancelLeaveRequest);
router.put('/:id/approve', requireAdmin, approveLeaveRequest);
router.put('/:id/reject', requireAdmin, rejectLeaveRequest);

export default router;
