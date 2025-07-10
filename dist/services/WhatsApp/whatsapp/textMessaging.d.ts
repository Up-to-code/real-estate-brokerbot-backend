import { WhatsAppConfig, WhatsAppResponse, SendOptions } from './types';
export declare function sendText(config: WhatsAppConfig, to: string, message: string, options?: SendOptions): Promise<WhatsAppResponse>;
export declare function sendTextWithTypingEffect(config: WhatsAppConfig, to: string, message: string, options?: SendOptions & {
    typingSpeed?: number;
}): Promise<WhatsAppResponse[]>;
