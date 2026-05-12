import { Request, Response } from 'express';
export declare const getDiscounts: (_req: Request, res: Response) => Promise<void>;
export declare const createDiscount: (req: Request, res: Response) => Promise<void>;
export declare const updateDiscount: (req: Request, res: Response) => Promise<void>;
export declare const deleteDiscount: (req: Request, res: Response) => Promise<void>;
export declare const validateCoupon: (req: Request, res: Response) => Promise<void>;
