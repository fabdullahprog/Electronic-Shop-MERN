import { Request, Response, NextFunction } from 'express';
interface CustomError extends Error {
    statusCode?: number;
    code?: number;
    keyValue?: Record<string, string>;
    kind?: string;
    errors?: Record<string, {
        message: string;
    }>;
}
declare const errorMiddleware: (err: CustomError, _req: Request, res: Response, _next: NextFunction) => void;
export default errorMiddleware;
