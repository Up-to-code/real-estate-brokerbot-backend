import { WhatsAppConfig, WhatsAppResponse, SendOptions } from './types';
export declare function sendLocation(config: WhatsAppConfig, to: string, latitude: number, longitude: number, name?: string, address?: string, options?: SendOptions): Promise<WhatsAppResponse>;
export declare function sendContact(config: WhatsAppConfig, to: string, name: string, phone: string, email?: string, options?: SendOptions): Promise<WhatsAppResponse>;
