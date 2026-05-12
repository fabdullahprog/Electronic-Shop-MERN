import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../types';

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;
  if (req.headers.authorization?.startsWith('Bearer')) token = req.headers.authorization.split(' ')[1];
  if (!token) { res.status(401).json({ success: false, message: 'Not authorized, no token' }); return; }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id).select('-password');
    if (!user) { res.status(401).json({ success: false, message: 'User not found' }); return; }
    if (!user.isActive) { res.status(401).json({ success: false, message: 'Account deactivated' }); return; }
    req.user = user;
    next();
  } catch { res.status(401).json({ success: false, message: 'Not authorized, token failed' }); }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role === 'admin') { next(); return; }
  res.status(403).json({ success: false, message: 'Admin access required' });
};
