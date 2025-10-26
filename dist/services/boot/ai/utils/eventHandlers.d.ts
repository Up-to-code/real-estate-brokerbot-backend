export declare function handleGeneratePropertyPdfEvent({ eventDetails, historySummary, name, prisma, getPropertyNameFromHistory, getSimilarityScore }: {
    eventDetails: any;
    historySummary: string;
    name?: string;
    prisma: any;
    getPropertyNameFromHistory: (historySummary: string) => string | undefined;
    getSimilarityScore: (a: string, b: string) => number;
}): Promise<string>;
