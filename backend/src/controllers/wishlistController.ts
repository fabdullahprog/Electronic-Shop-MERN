import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../types';

export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try { const user = await User.findById(req.user!._id).populate('wishlist'); res.json({ success: true, wishlist: user?.wishlist || [] }); }
  catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
export const toggleWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) { res.status(404).json({ success: false, message: 'Not found' }); return; }
    const productId = req.params.productId;
    const index = user.wishlist.findIndex(id => id.toString() === productId);
    let action: string;
    if (index > -1) { user.wishlist.splice(index, 1); action = 'removed'; }
    else { user.wishlist.push(productId as unknown as import('mongoose').Types.ObjectId); action = 'added'; }
    await user.save();
    res.json({ success: true, action, wishlist: user.wishlist });
  } catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
