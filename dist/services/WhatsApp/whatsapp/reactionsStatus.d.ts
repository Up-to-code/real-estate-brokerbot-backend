import { WhatsAppConfig, WhatsAppResponse } from './types';
export declare function sendReaction(config: WhatsAppConfig, to: string, messageId: string, emoji: string): Promise<WhatsAppResponse>;
export declare function removeReaction(config: WhatsAppConfig, to: string, messageId: string): Promise<WhatsAppResponse>;
export declare function markAsRead(config: WhatsAppConfig, messageId: string): Promise<{
    success: boolean;
}>;
