import { WhatsAppConfig, WhatsAppResponse, SendOptions } from './types';
export declare function sendText(config: WhatsAppConfig, to: string, message: string, options?: SendOptions): Promise<WhatsAppResponse>;
export declare function getDailyMessageStats(): Promise<{
    sent: number;
    remaining: number;
    limit: number;
    resetTime: Date;
}>;
export declare function resetDailyMessageCount(): Promise<void>;
export declare function cleanupOldMessageStats(daysToKeep?: number): Promise<void>;
