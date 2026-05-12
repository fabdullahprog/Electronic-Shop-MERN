import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const createReview: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProductReviews: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteReview: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllReviews: (_req: AuthRequest, res: Response) => Promise<void>;
