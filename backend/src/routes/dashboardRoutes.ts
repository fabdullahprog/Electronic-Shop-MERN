import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { protect, admin } from '../middleware/authMiddleware';
const router = Router();
router.get('/stats', protect, admin, getDashboardStats);
export default router;
