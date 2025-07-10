import { Request, Response, NextFunction } from "express";
declare const Handle_Message_webhook: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export default Handle_Message_webhook;
