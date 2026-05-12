import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const protect: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const admin: (req: AuthRequest, res: Response, next: NextFunction) => void;
