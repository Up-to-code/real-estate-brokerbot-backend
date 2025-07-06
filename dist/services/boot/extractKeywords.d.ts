interface KeywordResult {
    keyword: string;
    score: number;
    similarity: number;
    language: "ar" | "en" | "mixed";
    isRelevant: boolean;
}
interface ExtractionConfig {
    maxKeywords: number;
    minSimilarityThreshold: number;
    supportedLanguages: ("ar" | "en")[];
    minKeywordLength: number;
    contextWeight: number;
}
export declare function extractKeywords(text: string, maxKeywords?: number, referenceText?: string, config?: Partial<ExtractionConfig>): KeywordResult[] | null;
export declare function extractKeywordsSimple(text: string, count?: number): string[];
export declare function extractRelevantKeywords(text: string, referenceText: string, maxKeywords?: number, minSimilarity?: number): KeywordResult[] | null;
export { type KeywordResult, type ExtractionConfig };
