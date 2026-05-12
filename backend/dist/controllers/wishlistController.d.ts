import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const getWishlist: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleWishlist: (req: AuthRequest, res: Response) => Promise<void>;
