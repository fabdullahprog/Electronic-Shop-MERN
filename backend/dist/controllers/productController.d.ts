import { Request, Response } from 'express';
export declare const getProducts: (req: Request, res: Response) => Promise<void>;
export declare const getProduct: (req: Request, res: Response) => Promise<void>;
export declare const createProduct: (req: Request, res: Response) => Promise<void>;
export declare const updateProduct: (req: Request, res: Response) => Promise<void>;
export declare const deleteProduct: (req: Request, res: Response) => Promise<void>;
export declare const getTrendingProducts: (_req: Request, res: Response) => Promise<void>;
export declare const getRelatedProducts: (req: Request, res: Response) => Promise<void>;
export declare const getBrands: (_req: Request, res: Response) => Promise<void>;
