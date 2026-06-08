import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(`[Error] ${err.name}: ${err.message}`);
  
  let status = 500;
  if (err.message.includes('not found')) {
    status = 404;
  }

  res.status(status).json({
    status: 'ERROR',
    message: err.message || 'Internal Server Error'
  });
}
