export declare function createSystemPrompt(phoneNumber?: string, name?: string, historySummary?: string): string;
export declare function createUserPrompt(message: string, conversationContext?: string): string;
export declare function extractConversationContext(messages: Array<{
    role: string;
    content: string;
}>): string;
export declare function convertArabicDayToDate(day: string, base?: Date): string;
export declare function convertArabicTimeTo24Hour(time: string): string;
export declare function parseArabicPrice(text: string, context?: 'villa' | 'apartment' | 'land', userType?: string): number | null;
export declare function validateJSONResponse(response: string): {
    valid: boolean;
    error?: string;
    suggestion?: string;
};
export declare function cleanJSONResponse(response: string): string;
export declare function optimizePromptLength(system: string, user: string): {
    system: string;
    user: string;
    savedTokens: number;
};
export declare function extractSearchCriteria(msg: string, prev?: any, userProfile?: any): any;
export declare function getTomorrowDate(): string;
export declare function getCurrentTime(): string;
export declare function convertArabicNumerals(text: string): string;
export declare function detectUserIntent(message: string, history?: string): string;
export declare function detectSentiment(message: string): string;
export declare function extractDistrict(message: string): string | null;
export declare function buildUserProfile(messages: Array<{
    role: string;
    content: string;
}>): any;
export declare function generateSmartFollowUp(criteria: any, userProfile: any): string;
export declare function calculatePriceRange(budget: number, flexibility?: number): {
    min: number;
    max: number;
};
export declare function validateCriteriaCompleteness(criteria: any): {
    complete: boolean;
    missing: string[];
};
