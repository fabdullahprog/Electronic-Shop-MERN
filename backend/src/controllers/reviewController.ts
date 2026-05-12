import { Response } from 'express';
import Review from '../models/Review';
import Order from '../models/Order';
import { AuthRequest } from '../types';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, rating, title, comment } = req.body;
    const existing = await Review.findOne({ product: productId, user: req.user!._id });
    if (existing) { res.status(400).json({ success: false, message: 'Already reviewed' }); return; }
    const hasPurchased = await Order.findOne({ user: req.user!._id, 'items.product': productId, orderStatus: 'delivered' });
    const review = await Review.create({ product: productId, user: req.user!._id, rating, title, comment, isVerifiedPurchase: !!hasPurchased });
    res.status(201).json({ success: true, review });
  } catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
export const getProductReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try { const reviews = await Review.find({ product: req.params.productId, isApproved: true }).populate('user', 'name avatar').sort({ createdAt: -1 }); res.json({ success: true, reviews }); }
  catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    if (review.user.toString() !== req.user!._id.toString() && req.user!.role !== 'admin') { res.status(403).json({ success: false, message: 'Not authorized' }); return; }
    await review.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
export const getAllReviews = async (_req: AuthRequest, res: Response): Promise<void> => {
  try { const reviews = await Review.find().populate('user', 'name email').populate('product', 'name').sort({ createdAt: -1 }); res.json({ success: true, reviews }); }
  catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
