import { Response } from 'express';
import { AuthRequest } from '../types';
export declare const getAllUsers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUser: (req: AuthRequest, res: Response) => Promise<void>;
export declare const addAddress: (req: AuthRequest, res: Response) => Promise<void>;
