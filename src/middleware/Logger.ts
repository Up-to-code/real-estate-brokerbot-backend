import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  if (config.isDevelopment) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m'; // Red for errors, green for success
      const resetColor = '\x1b[0m';
      
      console.log(
        `${new Date().toISOString()} - ${req.method} ${req.path} - ${statusColor}${res.statusCode}${resetColor} - ${duration}ms`
      );
    });
  }
  
  next();
};