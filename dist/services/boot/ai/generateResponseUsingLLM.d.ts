export type ProcessedResult = {
    type: 'answer';
    text: string;
} | {
    type: 'search';
    query: string;
} | {
    type: 'event';
    name: string;
    details: string;
};
interface OpenAIService {
    sendPrompt(message: string): Promise<string>;
}
interface ResponseParser {
    parseResponse(response: string): ProcessedResult;
}
declare class ResponseParserImpl implements ResponseParser {
    parseResponse(response: string): ProcessedResult;
    private parseJsonResponse;
    private mapToProcessedResult;
}
export declare function processRealEstateMessage(message: string, openaiApiKey?: string): Promise<ProcessedResult>;
export declare const createMockServices: () => {
    openaiService: OpenAIService;
    responseParser: ResponseParserImpl;
};
export declare const isValidMessage: (message: string) => boolean;
export declare const detectLanguage: (message: string) => "ar" | "en";
export {};
