import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare const createError: (message: string, statusCode?: number) => AppError;
export declare const notFoundHandler: (req: Request, res: Response) => void;
export declare const errorHandler: (err: AppError, req: Request, res: Response, next: NextFunction) => void;
