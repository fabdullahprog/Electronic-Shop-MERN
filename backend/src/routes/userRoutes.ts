import { Router } from 'express';
import { getAllUsers, getUser, updateUser, addAddress } from '../controllers/userController';
import { protect, admin } from '../middleware/authMiddleware';
const router = Router();
router.get('/', protect, admin, getAllUsers);
router.get('/:id', protect, admin, getUser);
router.put('/:id', protect, admin, updateUser);
router.post('/address', protect, addAddress);
export default router;
