export declare class WhatsAppAPIError extends Error {
    code: number;
    type?: string | undefined;
    fbtrace_id?: string | undefined;
    constructor(message: string, code: number, type?: string | undefined, fbtrace_id?: string | undefined);
}
