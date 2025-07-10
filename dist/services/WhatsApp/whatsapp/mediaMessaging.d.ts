import { WhatsAppConfig, WhatsAppResponse, SendOptions } from './types';
export declare function sendImage(config: WhatsAppConfig, to: string, imageUrl: string, caption?: string, options?: SendOptions): Promise<WhatsAppResponse>;
export declare function sendImageWithText(config: WhatsAppConfig, to: string, imageUrl: string, text: string, options?: SendOptions & {
    typingSpeed?: number;
}): Promise<{
    image: WhatsAppResponse;
    text: WhatsAppResponse[];
}>;
export declare function sendDocument(config: WhatsAppConfig, to: string, documentUrl: string, filename?: string, caption?: string, options?: SendOptions): Promise<WhatsAppResponse>;
export declare function sendVideo(config: WhatsAppConfig, to: string, videoUrl: string, caption?: string, options?: SendOptions): Promise<WhatsAppResponse>;
export declare function sendAudio(config: WhatsAppConfig, to: string, audioUrl: string, options?: SendOptions): Promise<WhatsAppResponse>;
export declare function sendFile(config: WhatsAppConfig, to: string, fileUrl: string, filename?: string, caption?: string, options?: SendOptions): Promise<WhatsAppResponse>;
export declare function sendPDF(config: WhatsAppConfig, to: string, pdfUrl: string, filename?: string, caption?: string, options?: SendOptions): Promise<WhatsAppResponse>;
export declare function sendMultipleFiles(config: WhatsAppConfig, to: string, files: Array<{
    url: string;
    filename?: string;
    caption?: string;
}>, options?: SendOptions & {
    delayBetweenFiles?: number;
}): Promise<WhatsAppResponse[]>;
