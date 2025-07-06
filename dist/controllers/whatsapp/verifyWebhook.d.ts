import { Request, Response, NextFunction } from "express";
import { WebhookQuery } from "./type";
export declare const verifyWebhook: (req: Request<{}, {}, {}, WebhookQuery>, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
