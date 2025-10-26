export declare function buildHistorySummary(phoneNumber?: string): Promise<{
    summary: string;
    clientId?: string;
}>;
export declare function getPropertyNameFromHistory(historySummary: string): string | undefined;
export declare function saveSearchHistory(clientId: string, query: any, properties: any): Promise<void>;
