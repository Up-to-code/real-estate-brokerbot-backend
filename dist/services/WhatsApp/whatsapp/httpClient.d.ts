import { WhatsAppConfig, WhatsAppResponse } from './types';
export declare function makeApiRequest(config: WhatsAppConfig, endpoint: string, payload: any): Promise<WhatsAppResponse>;
