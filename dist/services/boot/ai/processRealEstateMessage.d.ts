import { ProcessedResult } from './types/aiTypes';
export declare function processRealEstateMessage(message: string, openaiApiKey?: string, phoneNumber?: string, name?: string, historySummary?: string): Promise<ProcessedResult>;
export declare const createMockServices: () => {
    openaiService: {
        sendPrompt: (message: string) => Promise<string>;
    };
    responseParser: import("./types/aiTypes").ResponseParser;
};
