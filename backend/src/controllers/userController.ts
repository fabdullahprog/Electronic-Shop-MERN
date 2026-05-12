import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../types';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query: Record<string, unknown> = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const [users, total] = await Promise.all([User.find(query).sort({ createdAt: -1 }).skip((Number(page)-1)*Number(limit)).limit(Number(limit)), User.countDocuments(query)]);
    res.json({ success: true, users, total });
  } catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try { const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, user }); }
  catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
export const getUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try { const user = await User.findById(req.params.id); if (!user) { res.status(404).json({ success: false, message: 'Not found' }); return; } res.json({ success: true, user }); }
  catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try { const user = await User.findById(req.user!._id); if (!user) { res.status(404).json({ success: false, message: 'Not found' }); return; } if (req.body.isDefault) user.addresses.forEach(a => { a.isDefault = false; }); user.addresses.push(req.body); await user.save(); res.json({ success: true, addresses: user.addresses }); }
  catch (e) { res.status(500).json({ success: false, message: (e as Error).message }); }
};
