import { WhatsAppConfig, WhatsAppResponse, SendOptions, InteractiveButton } from './types';
export declare function sendButtons(config: WhatsAppConfig, to: string, bodyText: string, buttons: InteractiveButton[], options?: SendOptions & {
    headerText?: string;
    footerText?: string;
}): Promise<WhatsAppResponse>;
export declare function sendList(config: WhatsAppConfig, to: string, bodyText: string, buttonText: string, sections: Array<{
    title?: string;
    rows: Array<{
        id: string;
        title: string;
        description?: string;
    }>;
}>, options?: SendOptions & {
    headerText?: string;
    footerText?: string;
}): Promise<WhatsAppResponse>;
