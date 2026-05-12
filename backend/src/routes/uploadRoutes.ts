import { Router } from 'express';
import { uploadImages, uploadMiddleware, deleteImage } from '../controllers/uploadController';
import { protect, admin } from '../middleware/authMiddleware';
const router = Router();
router.post('/', protect, admin, uploadMiddleware, uploadImages);
router.delete('/', protect, admin, deleteImage);
export default router;
