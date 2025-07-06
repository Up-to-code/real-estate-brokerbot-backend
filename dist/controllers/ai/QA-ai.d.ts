import { Request } from "express";
import { Response } from "express";
declare const getQAs: (req: Request, res: Response) => Promise<any>;
declare const CreateQA: (req: Request, res: Response) => Promise<any>;
declare const UpdateQA: (req: Request, res: Response) => Promise<any>;
declare const DeleteQA: (req: Request, res: Response) => Promise<any>;
export { getQAs, CreateQA, UpdateQA, DeleteQA, };
