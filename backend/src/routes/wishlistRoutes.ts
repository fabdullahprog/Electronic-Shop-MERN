import { Router } from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController';
import { protect } from '../middleware/authMiddleware';
const router = Router();
router.get('/', protect, getWishlist);
router.put('/:productId', protect, toggleWishlist);
export default router;
