import { Request, Response } from "express";
export declare const updateDailyMessagesCount: (req: Request, res: Response) => Promise<void>;
export declare const getDailyMessagesThisMonth: () => Promise<any>;
export declare const getMonthlyStats: (_: Request, res: Response) => Promise<void>;
export declare const getYearlyStats: (_: Request, res: Response) => Promise<void>;
