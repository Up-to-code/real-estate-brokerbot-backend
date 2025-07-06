import { Request, Response } from "express";
export declare const getAllCampaigns: (req: Request, res: Response) => Promise<void>;
export declare const getCampaignById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createCampaign: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateCampaign: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteCampaign: (req: Request, res: Response) => Promise<void>;
export declare const sendCampaign: (req: Request, res: Response) => Promise<void>;
