import { Router } from 'express';
import { createReview, getProductReviews, deleteReview, getAllReviews } from '../controllers/reviewController';
import { protect, admin } from '../middleware/authMiddleware';
const router = Router();
router.post('/', protect, createReview);
router.get('/product/:productId', getProductReviews);
router.get('/admin', protect, admin, getAllReviews);
router.delete('/:id', protect, deleteReview);
export default router;
