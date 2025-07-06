interface CampaignResult {
    success: boolean;
    error?: string;
    message?: string;
    sentCount?: number;
    failedCount?: number;
    details?: {
        totalTargets: number;
        remainingQuota: number;
    };
}
export declare function sendWhatsAppTemplateCampaign(campaignId: string): Promise<CampaignResult>;
export {};
