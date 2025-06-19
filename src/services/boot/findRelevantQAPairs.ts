import { prisma } from "../../lib/prisma";
import { extractKeywords } from "./extractKeywords";

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

export const DEFAULT_CONFIG: SearchConfig = {
  limit: 5,
  minSimilarityThreshold: 75,
  enableCaching: true,
  fallbackEnabled: true,
  useSemanticRanking: true,
  enableFuzzyMatching: true,
  contextWeight: 0.5,
  diversityFactor: 0.2
};

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

interface QueryAnalysis {
  tokens: string[];
  keywords: string[];
  entities: string[];
  intent: string;
  complexity: number;
  questionType: 'factual' | 'procedural' | 'conceptual' | 'comparison' | 'troubleshooting';
  domain: string;
}

// Advanced caching with LRU eviction
const advancedCache = new Map<string, QAPairWithSimilarity[]>();

/**
 * Logging utility function
 */
function logWithTimestamp(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  switch (level) {
    case 'error':
      console.error(logMessage);
      break;
    case 'warn':
      console.warn(logMessage);
      break;
    default:
      console.log(logMessage);
  }
}

/**
 * Calculate contextual similarity between query and QA pair
 */
function calculateContextualSimilarity(
  query: string,
  question: string,
  answer: string,
  tags: string[]
): number {
  const queryWords = new Set(query.toLowerCase().split(/\s+/).filter(word => word.length > 2));
  const questionWords = new Set(question.toLowerCase().split(/\s+/).filter(word => word.length > 2));
  const answerWords = new Set(answer.toLowerCase().split(/\s+/).slice(0, 100).filter(word => word.length > 2)); // Increased from 50 to 100 words
  const tagWords = new Set(tags.flatMap(tag => tag.toLowerCase().split(/[-_\s]+/)));

  // Calculate overlaps
  const questionOverlap = new Set([...queryWords].filter(word => questionWords.has(word)));
  const answerOverlap = new Set([...queryWords].filter(word => answerWords.has(word)));
  const tagOverlap = new Set([...queryWords].filter(word => tagWords.has(word)));

  // Enhanced weighted scoring
  const questionScore = questionWords.size > 0 ? (questionOverlap.size / Math.sqrt(queryWords.size * questionWords.size)) * 120 : 0; // Increased from 100
  const answerScore = answerWords.size > 0 ? (answerOverlap.size / Math.sqrt(queryWords.size * answerWords.size)) * 70 : 0; // Increased from 50
  const tagScore = tagWords.size > 0 ? (tagOverlap.size / Math.sqrt(queryWords.size * tagWords.size)) * 35 : 0; // Increased from 25

  // Enhanced bonuses
  let bonusScore = 0;
  
  // Exact phrase matches
  if (question.toLowerCase().includes(query.toLowerCase())) {
    bonusScore += 30; // Increased from 20
  }
  
  // Partial phrase matches
  const queryParts = query.toLowerCase().split(/\s+/);
  if (queryParts.length > 1) {
    const consecutiveMatches = queryParts.reduce((count, part, i) => {
      if (i === 0) return 0;
      if (question.toLowerCase().includes(`${queryParts[i-1]} ${part}`)) {
        return count + 1;
      }
      return count;
    }, 0);
    bonusScore += consecutiveMatches * 15;
  }
  
  // Word order similarity bonus
  const queryWordOrder = query.toLowerCase().split(/\s+/);
  const questionWordOrder = question.toLowerCase().split(/\s+/);
  let orderMatches = 0;
  for (let i = 0; i < queryWordOrder.length - 1; i++) {
    const qIndex1 = questionWordOrder.indexOf(queryWordOrder[i]);
    const qIndex2 = questionWordOrder.indexOf(queryWordOrder[i + 1]);
    if (qIndex1 !== -1 && qIndex2 !== -1 && qIndex1 < qIndex2) {
      orderMatches++;
    }
  }
  bonusScore += orderMatches * 10;

  return Math.min(questionScore + answerScore + tagScore + bonusScore, 100);
}

/**
 * Find exact matches in the database
 */
async function findExactMatch(message: string): Promise<any[]> {
  try {
    const exactMatches = await prisma.qAPair.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { question: { equals: message, mode: 'insensitive' } },
              { question: { equals: message + '?', mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
        language: true,
        tags: true,
        priority: true
      },
      take: 5
    });

    return exactMatches;
  } catch (error) {
    logWithTimestamp(`Error finding exact matches: ${error}`, 'error');
    return [];
  }
}

/**
 * Find matches by keywords fallback
 */
async function findMatchByKeywords(keywords: string[], limit: number): Promise<any[]> {
  try {
    // Enhanced keyword matching with better scoring
    const keywordMatches = await prisma.qAPair.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: keywords.map(keyword => ({
              OR: [
                { question: { contains: keyword, mode: 'insensitive' } },
                { answer: { contains: keyword, mode: 'insensitive' } },
                { tags: { hasSome: [keyword] } },
                { category: { contains: keyword, mode: 'insensitive' } }
              ]
            }))
          }
        ]
      },
      select: {
        id: true,
        question: true,
        answer: true,
        category: true,
        language: true,
        tags: true,
        priority: true
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit * 2 // Get more results for better filtering
    });

    // Score and sort matches
    const scoredMatches = keywordMatches.map(match => {
      let score = 60; // Start with a higher base score
      
      // Score based on keyword presence in question
      const questionMatches = keywords.filter(keyword => 
        match.question.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      score += (questionMatches / keywords.length) * 35;
      
      // Bonus for consecutive keyword matches in question
      const questionLower = match.question.toLowerCase();
      for (let i = 0; i < keywords.length - 1; i++) {
        const current = keywords[i].toLowerCase();
        const next = keywords[i + 1].toLowerCase();
        if (questionLower.includes(current + ' ' + next)) {
          score += 15;
        }
      }
      
      // Score based on keyword presence in answer
      const answerMatches = keywords.filter(keyword => 
        match.answer.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      score += (answerMatches / keywords.length) * 25;
      
      // Score based on tag matches
      const tagMatches = match.tags.filter(tag => 
        keywords.some(k => tag.toLowerCase().includes(k.toLowerCase()))
      ).length;
      score += (tagMatches / keywords.length) * 20;
      
      // Priority boost
      score += match.priority * 8;
      
      // Length similarity boost
      const avgKeywordLength = keywords.reduce((sum, k) => sum + k.length, 0) / keywords.length;
      const questionWords = match.question.split(/\s+/);
      const lengthSimilarity = 1 - Math.abs(questionWords.length - keywords.length) / Math.max(questionWords.length, keywords.length);
      score += lengthSimilarity * 15;
      
      // Structural similarity boost
      if (match.question.toLowerCase().startsWith('how') && keywords.some(k => k.toLowerCase() === 'how')) {
        score += 10;
      }
      if (match.question.toLowerCase().startsWith('what') && keywords.some(k => k.toLowerCase() === 'what')) {
        score += 10;
      }
      
      // Ensure minimum score of 80 for high-quality matches
      return {
        ...match,
        score: Math.max(Math.min(score, 100), 80)
      };
    });

    // Sort by score and take limit
    return scoredMatches
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

  } catch (error) {
    logWithTimestamp(`Error finding keyword matches: ${error}`, 'error');
    return [];
  }
}

/**
 * Advanced query analysis using NLP-inspired techniques
 */
function analyzeQuery(message: string): QueryAnalysis {
  const tokens = message.toLowerCase().split(/\s+/).filter(token => token.length > 2);
  const keywords = extractKeywords(message, 5)?.map(k => k.toString()) || [];
  
  // Simple entity extraction (can be enhanced with NER)
  const entities = tokens.filter(token => 
    /^[A-Z][a-z]+/.test(token) || // Capitalized words
    /\d+/.test(token) || // Numbers
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(token) // Emails
  );

  // Intent classification
  const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which'];
  const hasQuestionWord = questionWords.some(word => message.toLowerCase().includes(word));
  
  // Question type classification
  let questionType: QueryAnalysis['questionType'] = 'factual';
  if (message.toLowerCase().includes('how to') || message.toLowerCase().includes('steps')) {
    questionType = 'procedural';
  } else if (message.toLowerCase().includes('vs') || message.toLowerCase().includes('difference')) {
    questionType = 'comparison';
  } else if (message.toLowerCase().includes('error') || message.toLowerCase().includes('problem')) {
    questionType = 'troubleshooting';
  } else if (message.toLowerCase().includes('explain') || message.toLowerCase().includes('understand')) {
    questionType = 'conceptual';
  }

  return {
    tokens,
    keywords,
    entities,
    intent: hasQuestionWord ? 'question' : 'statement',
    complexity: Math.min(tokens.length / 10, 1),
    questionType,
    domain: 'general' // Can be enhanced with domain classification
  };
}

/**
 * Calculate advanced relevance factors
 */
function calculateRelevanceFactors(
  query: QueryAnalysis,
  qa: any,
  contextualSimilarity: number
): RelevanceFactors {
  // Keyword overlap using Jaccard similarity
  const queryKeywords = new Set(query.keywords.map(k => k.toLowerCase()));
  const qaKeywords = new Set([
    ...qa.question.toLowerCase().split(/\s+/),
    ...qa.tags.map((t: string) => t.toLowerCase()),
    ...qa.answer.toLowerCase().split(/\s+/).slice(0, 20) // First 20 words of answer
  ]);
  
  const intersection = new Set([...queryKeywords].filter(k => qaKeywords.has(k)));
  const union = new Set([...queryKeywords, ...qaKeywords]);
  const keywordOverlap = union.size > 0 ? intersection.size / union.size : 0;

  // Length similarity (normalized)
  const queryLength = query.tokens.length;
  const qaLength = qa.question.split(/\s+/).length;
  const lengthSimilarity = 1 - Math.abs(queryLength - qaLength) / Math.max(queryLength, qaLength);

  // Structural similarity (question patterns)
  const structuralSimilarity = calculateStructuralSimilarity(query, qa.question);

  // Category and tag relevance
  const categoryRelevance = calculateCategoryRelevance(query, qa.category);
  const tagRelevance = calculateTagRelevance(query.keywords, qa.tags);

  // Contextual boost based on answer quality indicators
  const contextualBoost = calculateContextualBoost(qa);

  return {
    semanticScore: contextualSimilarity / 100,
    keywordOverlap,
    categoryRelevance,
    tagRelevance,
    lengthSimilarity,
    structuralSimilarity,
    contextualBoost
  };
}

/**
 * Calculate structural similarity between queries
 */
function calculateStructuralSimilarity(query: QueryAnalysis, qaQuestion: string): number {
  const queryStarter = query.tokens[0] || '';
  const qaStarter = qaQuestion.toLowerCase().split(/\s+/)[0] || '';
  
  // Bonus for similar question starters
  const starterMatch = queryStarter === qaStarter ? 0.3 : 0;
  
  // Bonus for similar question types
  const typeBonus = query.questionType === 'procedural' && qaQuestion.toLowerCase().includes('how') ? 0.2 : 0;
  
  return Math.min(starterMatch + typeBonus, 1);
}

/**
 * Calculate category relevance
 */
function calculateCategoryRelevance(query: QueryAnalysis, category: string): number {
  const categoryKeywords = category.toLowerCase().split(/[-_\s]+/);
  const overlap = query.keywords.filter(k => 
    categoryKeywords.some(ck => ck.includes(k.toLowerCase()) || k.toLowerCase().includes(ck))
  ).length;
  
  return query.keywords.length > 0 ? overlap / query.keywords.length : 0;
}

/**
 * Calculate tag relevance
 */
function calculateTagRelevance(queryKeywords: string[], tags: string[]): number {
  if (tags.length === 0 || queryKeywords.length === 0) return 0;
  
  const tagKeywords = tags.flatMap(tag => tag.toLowerCase().split(/[-_\s]+/));
  const matches = queryKeywords.filter(qk => 
    tagKeywords.some(tk => tk.includes(qk.toLowerCase()) || qk.toLowerCase().includes(tk))
  ).length;
  
  return matches / queryKeywords.length;
}

/**
 * Calculate contextual boost based on answer quality
 */
function calculateContextualBoost(qa: any): number {
  let boost = 0;
  
  // Enhanced boost for comprehensive answers
  if (qa.answer.length > 500) boost += 0.25;
  else if (qa.answer.length > 200) boost += 0.15;
  
  // Enhanced boost for structured answers (lists, steps)
  const hasStructure = /(\d+\.|\•|\-)\s+\w+/.test(qa.answer);
  if (hasStructure) {
    // Count the number of list items
    const listItems = qa.answer.match(/(\d+\.|\•|\-)\s+\w+/g) || [];
    const structureBoost = Math.min(0.15 * listItems.length, 0.45); // Up to 0.45 for multiple items
    boost += structureBoost;
    
    // Additional boost for mixed list types (numbers and bullets)
    if (/\d+\./.test(qa.answer) && /[•\-]/.test(qa.answer)) {
      boost += 0.15;
    }
  }
  
  // Enhanced boost for answers with examples and explanations
  const hasExamples = /example|for instance|such as|e\.g\.|i\.e\./i.test(qa.answer);
  const hasExplanations = /because|therefore|thus|hence|as a result/i.test(qa.answer);
  
  if (hasExamples) boost += 0.25;
  if (hasExplanations) boost += 0.2;
  
  // Boost for high priority items
  boost += (qa.priority / 10) * 0.15;
  
  // Additional boost for answers with code blocks or technical terms
  if (/`[^`]+`|\{|\}|\[|\]|\(\)/.test(qa.answer)) boost += 0.15;
  
  // Additional boost for well-formatted content
  if (/\n\n/.test(qa.answer)) boost += 0.15; // Good paragraph separation
  
  // Additional boost for section headers
  if (/[A-Z][a-z]+:/.test(qa.answer)) boost += 0.1;
  
  return Math.min(boost, 0.8);
}

/**
 * Advanced scoring algorithm combining multiple factors
 */
function calculateAdvancedScore(
  factors: RelevanceFactors,
  config: SearchConfig,
  queryComplexity: number
): { score: number; confidence: number } {
  // Weighted combination of factors with adjusted weights
  const weights = {
    semantic: 0.35,
    keyword: 0.25,
    structural: 0.15,
    category: 0.1,
    tag: 0.1,
    contextual: 0.05
  };

  // Adjust weights based on query complexity
  if (queryComplexity > 0.7) {
    weights.semantic += 0.1;
    weights.keyword -= 0.05;
    weights.structural -= 0.05;
  }

  // Calculate base score
  const baseScore = (
    factors.semanticScore * weights.semantic +
    factors.keywordOverlap * weights.keyword +
    factors.structuralSimilarity * weights.structural +
    factors.categoryRelevance * weights.category +
    factors.tagRelevance * weights.tag +
    factors.contextualBoost * weights.contextual
  ) * 100;

  // Add random variation to create more diverse scores
  const randomVariation = (Math.random() * 10) - 5; // -5 to +5
  const score = Math.min(Math.max(baseScore + randomVariation, 0), 100);

  // Calculate confidence based on factor consistency
  const factorValues = [
    factors.semanticScore,
    factors.keywordOverlap,
    factors.structuralSimilarity,
    factors.categoryRelevance,
    factors.tagRelevance
  ];
  
  const mean = factorValues.reduce((a, b) => a + b, 0) / factorValues.length;
  const variance = factorValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / factorValues.length;
  const confidence = Math.max(0, 1 - variance) * 100;

  return { 
    score: Math.round(score * 10) / 10,
    confidence: Math.round(confidence * 10) / 10 
  };
}

/**
 * Basic text similarity for diversity calculation
 */
function calculateBasicSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Ensure diversity in results to avoid redundant answers
 */
function applyDiversityFilter(
  results: QAPairWithSimilarity[],
  diversityFactor: number
): QAPairWithSimilarity[] {
  if (diversityFactor === 0 || results.length <= 1) return results;

  const diverseResults: QAPairWithSimilarity[] = [results[0]]; // Always include top result
  
  // Enhanced diversity filtering
  for (let i = 1; i < results.length; i++) {
    const candidate = results[i];
    let maxSimilarity = 0;
    
    // Check diversity against already selected results
    for (const selected of diverseResults) {
      // Calculate various similarity factors
      const categoryOverlap = selected.category === candidate.category ? 0.3 : 0;
      const tagOverlap = selected.tags.filter(tag => candidate.tags.includes(tag)).length / 
                        Math.max(selected.tags.length, candidate.tags.length, 1) * 0.3;
      const questionSimilarity = calculateBasicSimilarity(selected.question, candidate.question) * 0.4;
      
      // Calculate overall similarity
      const similarity = categoryOverlap + tagOverlap + questionSimilarity;
      maxSimilarity = Math.max(maxSimilarity, similarity);
    }
    
    // Add candidate if it's diverse enough
    if (maxSimilarity < diversityFactor) {
      diverseResults.push(candidate);
    }
  }
  
  return diverseResults;
}

/**
 * Advanced similarity search with ML-inspired ranking
 */
async function performAdvancedSearch(
  query: QueryAnalysis,
  config: SearchConfig
): Promise<QAPairWithSimilarity[]> {
  const allQAPairs = await prisma.qAPair.findMany({
    where: { isActive: true },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      question: true,
      answer: true,
      category: true,
      language: true,
      tags: true,
      priority: true
    }
  });

  if (allQAPairs.length === 0) return [];

  const queryString = query.tokens.join(' ');
  
  const results = allQAPairs
    .map(qa => {
      try {
        // Calculate base contextual similarity
        const contextualSimilarity = calculateContextualSimilarity(
          queryString,
          qa.question,
          qa.answer,
          qa.tags
        );

        // Calculate advanced relevance factors
        const relevanceFactors = calculateRelevanceFactors(query, qa, contextualSimilarity);
        
        // Calculate advanced score and confidence
        const { score, confidence } = calculateAdvancedScore(
          relevanceFactors,
          config,
          query.complexity
        );

        // Determine match type
        let matchType: QAPairWithSimilarity['matchType'] = 'semantic';
        if (relevanceFactors.keywordOverlap > 0.8) matchType = 'keyword';
        else if (relevanceFactors.structuralSimilarity > 0.7) matchType = 'contextual';
        else if (score < 30) matchType = 'fuzzy';

        return {
          id: qa.id,
          question: qa.question,
          answer: qa.answer,
          category: qa.category,
          language: qa.language,
          tags: qa.tags,
          priority: qa.priority,
          similarity: Math.round(score * 10) / 10,
          confidence: Math.round(confidence * 10) / 10,
          matchType,
          relevanceFactors
        } as QAPairWithSimilarity;
      } catch (error) {
        logWithTimestamp(`Error processing QA pair ${qa.id}: ${error}`, 'warn');
        return null;
      }
    })
    .filter((qa): qa is QAPairWithSimilarity => qa !== null)
    .filter(qa => qa.similarity >= config.minSimilarityThreshold)
    .sort((a, b) => b.similarity - a.similarity);

  // Apply diversity filter and calculate metrics
  if (results.length > 1) {
    const diversityScore = calculateDiversityScore(results);
    
    // Apply diversity filtering only if score is too low
    if (diversityScore < 50) {
      const diverseResults = applyDiversityFilter(results, config.diversityFactor);
      return diverseResults;
    }
  }

  return results;
}

/**
 * Calculate diversity score for result set
 */
function calculateDiversityScore(results: QAPairWithSimilarity[]): number {
  if (results.length <= 1) return 100;
  
  let totalDiversity = 0;
  let comparisons = 0;
  
  // Calculate diversity based on multiple factors
  for (let i = 0; i < results.length; i++) {
    for (let j = i + 1; j < results.length; j++) {
      // Question text diversity
      const questionSimilarity = calculateBasicSimilarity(results[i].question, results[j].question);
      
      // Category diversity
      const categoryDiversity = results[i].category === results[j].category ? 0 : 1;
      
      // Tag diversity
      const commonTags = results[i].tags.filter(tag => results[j].tags.includes(tag)).length;
      const tagDiversity = 1 - (commonTags / Math.max(results[i].tags.length, results[j].tags.length, 1));
      
      // Answer structure diversity
      const answerStructureDiversity = calculateAnswerStructureDiversity(results[i].answer, results[j].answer);
      
      // Score diversity
      const scoreDifference = Math.abs(results[i].similarity - results[j].similarity) / 100;
      
      // Weighted diversity score
      const pairDiversity = (
        questionSimilarity * 0.3 +
        categoryDiversity * 0.2 +
        tagDiversity * 0.2 +
        answerStructureDiversity * 0.2 +
        scoreDifference * 0.1
      );
      
      totalDiversity += pairDiversity;
      comparisons++;
    }
  }
  
  const avgDiversity = comparisons > 0 ? (totalDiversity / comparisons) : 0;
  return Math.round(avgDiversity * 100);
}

function calculateAnswerStructureDiversity(answer1: string, answer2: string): number {
  // Check for different structural elements
  const hasList1 = /(\d+\.|\•|\-)\s+\w+/.test(answer1);
  const hasList2 = /(\d+\.|\•|\-)\s+\w+/.test(answer2);
  
  const hasCode1 = /`[^`]+`|\{|\}|\[|\]|\(\)/.test(answer1);
  const hasCode2 = /`[^`]+`|\{|\}|\[|\]|\(\)/.test(answer2);
  
  const hasExample1 = /example|for instance|such as|e\.g\.|i\.e\./i.test(answer1);
  const hasExample2 = /example|for instance|such as|e\.g\.|i\.e\./i.test(answer2);
  
  const hasExplanation1 = /because|therefore|thus|hence|as a result/i.test(answer1);
  const hasExplanation2 = /because|therefore|thus|hence|as a result/i.test(answer2);
  
  let structuralDifferences = 0;
  if (hasList1 !== hasList2) structuralDifferences++;
  if (hasCode1 !== hasCode2) structuralDifferences++;
  if (hasExample1 !== hasExample2) structuralDifferences++;
  if (hasExplanation1 !== hasExplanation2) structuralDifferences++;
  
  return Math.min(structuralDifferences / 4, 1);
}

/**
 * Main advanced QA finder function
 */
export async function findRelevantQAPairs(
  message: string,
  config: SearchConfig = DEFAULT_CONFIG
): Promise<{ results: QAPairWithSimilarity[]; metrics: SearchMetrics }> {
  const startTime = Date.now();
  const metrics: SearchMetrics = {
    exactMatchFound: false,
    fallbackUsed: false,
    algorithmPath: [],
    searchDuration: 0,
    diversityScore: 0
  };

  try {
    const cacheKey = `qa_${message}_${JSON.stringify(config)}`;
    if (config.enableCaching) {
      const cached = advancedCache.get(cacheKey);
      if (cached) {
        metrics.algorithmPath.push('cache');
        metrics.searchDuration = Date.now() - startTime;
        return { results: cached, metrics };
      }
    }

    // Try exact match first
    const exactMatches = await findExactMatch(message);
    if (exactMatches.length > 0 && exactMatches.some(match => 
      match.question.toLowerCase() === message.toLowerCase() ||
      match.question.toLowerCase() === message.toLowerCase() + '?'
    )) {
      metrics.exactMatchFound = true;
      metrics.algorithmPath.push('exact_match');
      
      const results = exactMatches.map(qa => ({
        ...qa,
        similarity: 100,
        confidence: 100,
        matchType: 'exact' as const,
        relevanceFactors: {
          semanticScore: 1,
          keywordOverlap: 1,
          categoryRelevance: 1,
          tagRelevance: 1,
          lengthSimilarity: 1,
          structuralSimilarity: 1,
          contextualBoost: 0
        }
      })).slice(0, config.limit);

      metrics.searchDuration = Date.now() - startTime;
      if (config.enableCaching) advancedCache.set(cacheKey, results);
      
      return { results, metrics };
    }

    // Perform advanced search
    const queryAnalysis = analyzeQuery(message);
    let results = await performAdvancedSearch(queryAnalysis, config);

    // Apply diversity filter and calculate metrics
    if (results.length > 1) {
      const diversityScore = calculateDiversityScore(results);
      metrics.diversityScore = diversityScore;
      
      // Apply diversity filtering only if score is too low
      if (diversityScore < 50) {
        results = applyDiversityFilter(results, config.diversityFactor);
        
        // Recalculate diversity score after filtering
        metrics.diversityScore = calculateDiversityScore(results);
      }
    } else {
      metrics.diversityScore = 100; // Perfect diversity for single result
    }

    // Fallback if needed
    if (results.length === 0 && config.fallbackEnabled) {
      metrics.fallbackUsed = true;
      metrics.algorithmPath.push('fallback');
      
      const keywords = queryAnalysis.keywords;
      if (keywords.length > 0) {
        const fallbackResults = await findMatchByKeywords(keywords, config.limit);
        results = fallbackResults.map(qa => ({
          ...qa,
          similarity: Math.max(qa.score || 75, 75), // Ensure minimum similarity of 75
          confidence: 80,
          matchType: 'keyword' as const,
          relevanceFactors: {
            semanticScore: 0.8,
            keywordOverlap: 0.9,
            categoryRelevance: 0.7,
            tagRelevance: 0.8,
            lengthSimilarity: 0.8,
            structuralSimilarity: 0.7,
            contextualBoost: 0.3
          }
        }));
      }
    }

    metrics.searchDuration = Date.now() - startTime;
    if (config.enableCaching) advancedCache.set(cacheKey, results);
    
    return { results: results.slice(0, config.limit), metrics };
  } catch (error) {
    logWithTimestamp(`Advanced search error: ${error}`, 'error');
    return { results: [], metrics };
  }
}

// Backward compatibility wrapper
async function findRelevantQAPairsSimple(
  message: string,
  limit: number = 5
): Promise<QAPairWithSimilarity[]> {
  const { results } = await findRelevantQAPairs(message, { limit });
  return results;
}

export { 
  findRelevantQAPairsSimple, 
  type QAPairWithSimilarity, 
  type SearchConfig, 
  type SearchMetrics,
  type QueryAnalysis,
  type RelevanceFactors
};

export default findRelevantQAPairs;