import { Request, Response, NextFunction } from 'express';
interface CustomError extends Error { statusCode?: number; code?: number; keyValue?: Record<string,string>; kind?: string; errors?: Record<string,{message:string}>; }
const errorMiddleware = (err: CustomError, _req: Request, res: Response, _next: NextFunction): void => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  if (err.name==='CastError'&&err.kind==='ObjectId'){statusCode=404;message='Resource not found';}
  if (err.code===11000){statusCode=400;const field=Object.keys(err.keyValue||{})[0];message=`${field} already exists`;}
  if (err.name==='ValidationError'){statusCode=400;message=Object.values(err.errors||{}).map(e=>e.message).join(', ');}
  if (err.name==='JsonWebTokenError'){statusCode=401;message='Invalid token';}
  if (err.name==='TokenExpiredError'){statusCode=401;message='Token expired';}
  res.status(statusCode).json({success:false,message,...(process.env.NODE_ENV==='development'&&{stack:err.stack})});
};
export default errorMiddleware;
