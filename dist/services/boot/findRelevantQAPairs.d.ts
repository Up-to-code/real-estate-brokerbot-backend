export interface SearchConfig {
    limit: number;
    minSimilarityThreshold: number;
    enableCaching: boolean;
    fallbackEnabled: boolean;
    useSemanticRanking: boolean;
    enableFuzzyMatching: boolean;
    contextWeight: number;
    diversityFactor: number;
}
export declare const DEFAULT_CONFIG: SearchConfig;
export interface SearchMetrics {
    exactMatchFound: boolean;
    fallbackUsed: boolean;
    algorithmPath: string[];
    searchDuration: number;
    diversityScore: number;
}
export interface QAPairWithSimilarity {
    id: string;
    question: string;
    answer: string;
    category: string;
    language: string;
    tags: string[];
    priority: number;
    similarity: number;
    confidence: number;
    matchType: 'exact' | 'semantic' | 'keyword' | 'fuzzy' | 'contextual';
    relevanceFactors: RelevanceFactors;
}
export interface RelevanceFactors {
    semanticScore: number;
    keywordOverlap: number;
    categoryRelevance: number;
    tagRelevance: number;
    lengthSimilarity: number;
    structuralSimilarity: number;
    contextualBoost: number;
}
export declare function findRelevantQAPairs(message: string, config?: SearchConfig): Promise<{
    results: QAPairWithSimilarity[];
    metrics: SearchMetrics;
}>;
export default findRelevantQAPairs;
