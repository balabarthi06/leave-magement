import { Router } from 'express';
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday
} from '../controllers/holidayController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getHolidays);
router.post('/', requireAdmin, createHoliday);
router.put('/:id', requireAdmin, updateHoliday);
router.delete('/:id', requireAdmin, deleteHoliday);

export default router;
