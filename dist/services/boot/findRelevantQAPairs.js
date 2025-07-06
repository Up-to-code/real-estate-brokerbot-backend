"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = void 0;
exports.findRelevantQAPairs = findRelevantQAPairs;
const prisma_1 = require("../../lib/prisma");
const extractKeywords_1 = require("./extractKeywords");
exports.DEFAULT_CONFIG = {
    limit: 5,
    minSimilarityThreshold: 75,
    enableCaching: true,
    fallbackEnabled: true,
    useSemanticRanking: true,
    enableFuzzyMatching: true,
    contextWeight: 0.5,
    diversityFactor: 0.2
};
const advancedCache = new Map();
function logWithTimestamp(message, level = 'info') {
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
function calculateContextualSimilarity(query, question, answer, tags) {
    const queryWords = new Set(query.toLowerCase().split(/\s+/).filter(word => word.length > 2));
    const questionWords = new Set(question.toLowerCase().split(/\s+/).filter(word => word.length > 2));
    const answerWords = new Set(answer.toLowerCase().split(/\s+/).slice(0, 100).filter(word => word.length > 2));
    const tagWords = new Set(tags.flatMap(tag => tag.toLowerCase().split(/[-_\s]+/)));
    const questionOverlap = new Set([...queryWords].filter(word => questionWords.has(word)));
    const answerOverlap = new Set([...queryWords].filter(word => answerWords.has(word)));
    const tagOverlap = new Set([...queryWords].filter(word => tagWords.has(word)));
    const questionScore = questionWords.size > 0 ? (questionOverlap.size / Math.sqrt(queryWords.size * questionWords.size)) * 120 : 0;
    const answerScore = answerWords.size > 0 ? (answerOverlap.size / Math.sqrt(queryWords.size * answerWords.size)) * 70 : 0;
    const tagScore = tagWords.size > 0 ? (tagOverlap.size / Math.sqrt(queryWords.size * tagWords.size)) * 35 : 0;
    let bonusScore = 0;
    if (question.toLowerCase().includes(query.toLowerCase())) {
        bonusScore += 30;
    }
    const queryParts = query.toLowerCase().split(/\s+/);
    if (queryParts.length > 1) {
        const consecutiveMatches = queryParts.reduce((count, part, i) => {
            if (i === 0)
                return 0;
            if (question.toLowerCase().includes(`${queryParts[i - 1]} ${part}`)) {
                return count + 1;
            }
            return count;
        }, 0);
        bonusScore += consecutiveMatches * 15;
    }
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
async function findExactMatch(message) {
    try {
        const exactMatches = await prisma_1.prisma.qAPair.findMany({
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
    }
    catch (error) {
        logWithTimestamp(`Error finding exact matches: ${error}`, 'error');
        return [];
    }
}
async function findMatchByKeywords(keywords, limit) {
    try {
        const keywordMatches = await prisma_1.prisma.qAPair.findMany({
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
            take: limit * 2
        });
        const scoredMatches = keywordMatches.map(match => {
            let score = 60;
            const questionMatches = keywords.filter(keyword => match.question.toLowerCase().includes(keyword.toLowerCase())).length;
            score += (questionMatches / keywords.length) * 35;
            const questionLower = match.question.toLowerCase();
            for (let i = 0; i < keywords.length - 1; i++) {
                const current = keywords[i].toLowerCase();
                const next = keywords[i + 1].toLowerCase();
                if (questionLower.includes(current + ' ' + next)) {
                    score += 15;
                }
            }
            const answerMatches = keywords.filter(keyword => match.answer.toLowerCase().includes(keyword.toLowerCase())).length;
            score += (answerMatches / keywords.length) * 25;
            const tagMatches = match.tags.filter(tag => keywords.some(k => tag.toLowerCase().includes(k.toLowerCase()))).length;
            score += (tagMatches / keywords.length) * 20;
            score += match.priority * 8;
            const avgKeywordLength = keywords.reduce((sum, k) => sum + k.length, 0) / keywords.length;
            const questionWords = match.question.split(/\s+/);
            const lengthSimilarity = 1 - Math.abs(questionWords.length - keywords.length) / Math.max(questionWords.length, keywords.length);
            score += lengthSimilarity * 15;
            if (match.question.toLowerCase().startsWith('how') && keywords.some(k => k.toLowerCase() === 'how')) {
                score += 10;
            }
            if (match.question.toLowerCase().startsWith('what') && keywords.some(k => k.toLowerCase() === 'what')) {
                score += 10;
            }
            return {
                ...match,
                score: Math.max(Math.min(score, 100), 80)
            };
        });
        return scoredMatches
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }
    catch (error) {
        logWithTimestamp(`Error finding keyword matches: ${error}`, 'error');
        return [];
    }
}
function analyzeQuery(message) {
    const tokens = message.toLowerCase().split(/\s+/).filter(token => token.length > 2);
    const keywords = (0, extractKeywords_1.extractKeywords)(message, 5)?.map(k => k.toString()) || [];
    const entities = tokens.filter(token => /^[A-Z][a-z]+/.test(token) ||
        /\d+/.test(token) ||
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(token));
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which'];
    const hasQuestionWord = questionWords.some(word => message.toLowerCase().includes(word));
    let questionType = 'factual';
    if (message.toLowerCase().includes('how to') || message.toLowerCase().includes('steps')) {
        questionType = 'procedural';
    }
    else if (message.toLowerCase().includes('vs') || message.toLowerCase().includes('difference')) {
        questionType = 'comparison';
    }
    else if (message.toLowerCase().includes('error') || message.toLowerCase().includes('problem')) {
        questionType = 'troubleshooting';
    }
    else if (message.toLowerCase().includes('explain') || message.toLowerCase().includes('understand')) {
        questionType = 'conceptual';
    }
    return {
        tokens,
        keywords,
        entities,
        intent: hasQuestionWord ? 'question' : 'statement',
        complexity: Math.min(tokens.length / 10, 1),
        questionType,
        domain: 'general'
    };
}
function calculateRelevanceFactors(query, qa, contextualSimilarity) {
    const queryKeywords = new Set(query.keywords.map(k => k.toLowerCase()));
    const qaKeywords = new Set([
        ...qa.question.toLowerCase().split(/\s+/),
        ...qa.tags.map((t) => t.toLowerCase()),
        ...qa.answer.toLowerCase().split(/\s+/).slice(0, 20)
    ]);
    const intersection = new Set([...queryKeywords].filter(k => qaKeywords.has(k)));
    const union = new Set([...queryKeywords, ...qaKeywords]);
    const keywordOverlap = union.size > 0 ? intersection.size / union.size : 0;
    const queryLength = query.tokens.length;
    const qaLength = qa.question.split(/\s+/).length;
    const lengthSimilarity = 1 - Math.abs(queryLength - qaLength) / Math.max(queryLength, qaLength);
    const structuralSimilarity = calculateStructuralSimilarity(query, qa.question);
    const categoryRelevance = calculateCategoryRelevance(query, qa.category);
    const tagRelevance = calculateTagRelevance(query.keywords, qa.tags);
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
function calculateStructuralSimilarity(query, qaQuestion) {
    const queryStarter = query.tokens[0] || '';
    const qaStarter = qaQuestion.toLowerCase().split(/\s+/)[0] || '';
    const starterMatch = queryStarter === qaStarter ? 0.3 : 0;
    const typeBonus = query.questionType === 'procedural' && qaQuestion.toLowerCase().includes('how') ? 0.2 : 0;
    return Math.min(starterMatch + typeBonus, 1);
}
function calculateCategoryRelevance(query, category) {
    const categoryKeywords = category.toLowerCase().split(/[-_\s]+/);
    const overlap = query.keywords.filter(k => categoryKeywords.some(ck => ck.includes(k.toLowerCase()) || k.toLowerCase().includes(ck))).length;
    return query.keywords.length > 0 ? overlap / query.keywords.length : 0;
}
function calculateTagRelevance(queryKeywords, tags) {
    if (tags.length === 0 || queryKeywords.length === 0)
        return 0;
    const tagKeywords = tags.flatMap(tag => tag.toLowerCase().split(/[-_\s]+/));
    const matches = queryKeywords.filter(qk => tagKeywords.some(tk => tk.includes(qk.toLowerCase()) || qk.toLowerCase().includes(tk))).length;
    return matches / queryKeywords.length;
}
function calculateContextualBoost(qa) {
    let boost = 0;
    if (qa.answer.length > 500)
        boost += 0.25;
    else if (qa.answer.length > 200)
        boost += 0.15;
    const hasStructure = /(\d+\.|\•|\-)\s+\w+/.test(qa.answer);
    if (hasStructure) {
        const listItems = qa.answer.match(/(\d+\.|\•|\-)\s+\w+/g) || [];
        const structureBoost = Math.min(0.15 * listItems.length, 0.45);
        boost += structureBoost;
        if (/\d+\./.test(qa.answer) && /[•\-]/.test(qa.answer)) {
            boost += 0.15;
        }
    }
    const hasExamples = /example|for instance|such as|e\.g\.|i\.e\./i.test(qa.answer);
    const hasExplanations = /because|therefore|thus|hence|as a result/i.test(qa.answer);
    if (hasExamples)
        boost += 0.25;
    if (hasExplanations)
        boost += 0.2;
    boost += (qa.priority / 10) * 0.15;
    if (/`[^`]+`|\{|\}|\[|\]|\(\)/.test(qa.answer))
        boost += 0.15;
    if (/\n\n/.test(qa.answer))
        boost += 0.15;
    if (/[A-Z][a-z]+:/.test(qa.answer))
        boost += 0.1;
    return Math.min(boost, 0.8);
}
function calculateAdvancedScore(factors, config, queryComplexity) {
    const weights = {
        semantic: 0.35,
        keyword: 0.25,
        structural: 0.15,
        category: 0.1,
        tag: 0.1,
        contextual: 0.05
    };
    if (queryComplexity > 0.7) {
        weights.semantic += 0.1;
        weights.keyword -= 0.05;
        weights.structural -= 0.05;
    }
    const baseScore = (factors.semanticScore * weights.semantic +
        factors.keywordOverlap * weights.keyword +
        factors.structuralSimilarity * weights.structural +
        factors.categoryRelevance * weights.category +
        factors.tagRelevance * weights.tag +
        factors.contextualBoost * weights.contextual) * 100;
    const randomVariation = (Math.random() * 10) - 5;
    const score = Math.min(Math.max(baseScore + randomVariation, 0), 100);
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
function calculateBasicSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    return union.size > 0 ? intersection.size / union.size : 0;
}
function applyDiversityFilter(results, diversityFactor) {
    if (diversityFactor === 0 || results.length <= 1)
        return results;
    const diverseResults = [results[0]];
    for (let i = 1; i < results.length; i++) {
        const candidate = results[i];
        let maxSimilarity = 0;
        for (const selected of diverseResults) {
            const categoryOverlap = selected.category === candidate.category ? 0.3 : 0;
            const tagOverlap = selected.tags.filter(tag => candidate.tags.includes(tag)).length /
                Math.max(selected.tags.length, candidate.tags.length, 1) * 0.3;
            const questionSimilarity = calculateBasicSimilarity(selected.question, candidate.question) * 0.4;
            const similarity = categoryOverlap + tagOverlap + questionSimilarity;
            maxSimilarity = Math.max(maxSimilarity, similarity);
        }
        if (maxSimilarity < diversityFactor) {
            diverseResults.push(candidate);
        }
    }
    return diverseResults;
}
async function performAdvancedSearch(query, config) {
    const allQAPairs = await prisma_1.prisma.qAPair.findMany({
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
    if (allQAPairs.length === 0)
        return [];
    const queryString = query.tokens.join(' ');
    const results = allQAPairs
        .map(qa => {
        try {
            const contextualSimilarity = calculateContextualSimilarity(queryString, qa.question, qa.answer, qa.tags);
            const relevanceFactors = calculateRelevanceFactors(query, qa, contextualSimilarity);
            const { score, confidence } = calculateAdvancedScore(relevanceFactors, config, query.complexity);
            let matchType = 'semantic';
            if (relevanceFactors.keywordOverlap > 0.8)
                matchType = 'keyword';
            else if (relevanceFactors.structuralSimilarity > 0.7)
                matchType = 'contextual';
            else if (score < 30)
                matchType = 'fuzzy';
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
            };
        }
        catch (error) {
            logWithTimestamp(`Error processing QA pair ${qa.id}: ${error}`, 'warn');
            return null;
        }
    })
        .filter((qa) => qa !== null)
        .filter(qa => qa.similarity >= config.minSimilarityThreshold)
        .sort((a, b) => b.similarity - a.similarity);
    if (results.length > 1) {
        const diversityScore = calculateDiversityScore(results);
        if (diversityScore < 50) {
            const diverseResults = applyDiversityFilter(results, config.diversityFactor);
            return diverseResults;
        }
    }
    return results;
}
function calculateDiversityScore(results) {
    if (results.length <= 1)
        return 100;
    let totalDiversity = 0;
    let comparisons = 0;
    for (let i = 0; i < results.length; i++) {
        for (let j = i + 1; j < results.length; j++) {
            const questionSimilarity = calculateBasicSimilarity(results[i].question, results[j].question);
            const categoryDiversity = results[i].category === results[j].category ? 0 : 1;
            const commonTags = results[i].tags.filter(tag => results[j].tags.includes(tag)).length;
            const tagDiversity = 1 - (commonTags / Math.max(results[i].tags.length, results[j].tags.length, 1));
            const answerStructureDiversity = calculateAnswerStructureDiversity(results[i].answer, results[j].answer);
            const scoreDifference = Math.abs(results[i].similarity - results[j].similarity) / 100;
            const pairDiversity = (questionSimilarity * 0.3 +
                categoryDiversity * 0.2 +
                tagDiversity * 0.2 +
                answerStructureDiversity * 0.2 +
                scoreDifference * 0.1);
            totalDiversity += pairDiversity;
            comparisons++;
        }
    }
    const avgDiversity = comparisons > 0 ? (totalDiversity / comparisons) : 0;
    return Math.round(avgDiversity * 100);
}
function calculateAnswerStructureDiversity(answer1, answer2) {
    const hasList1 = /(\d+\.|\•|\-)\s+\w+/.test(answer1);
    const hasList2 = /(\d+\.|\•|\-)\s+\w+/.test(answer2);
    const hasCode1 = /`[^`]+`|\{|\}|\[|\]|\(\)/.test(answer1);
    const hasCode2 = /`[^`]+`|\{|\}|\[|\]|\(\)/.test(answer2);
    const hasExample1 = /example|for instance|such as|e\.g\.|i\.e\./i.test(answer1);
    const hasExample2 = /example|for instance|such as|e\.g\.|i\.e\./i.test(answer2);
    const hasExplanation1 = /because|therefore|thus|hence|as a result/i.test(answer1);
    const hasExplanation2 = /because|therefore|thus|hence|as a result/i.test(answer2);
    let structuralDifferences = 0;
    if (hasList1 !== hasList2)
        structuralDifferences++;
    if (hasCode1 !== hasCode2)
        structuralDifferences++;
    if (hasExample1 !== hasExample2)
        structuralDifferences++;
    if (hasExplanation1 !== hasExplanation2)
        structuralDifferences++;
    return Math.min(structuralDifferences / 4, 1);
}
async function findRelevantQAPairs(message, config = exports.DEFAULT_CONFIG) {
    const startTime = Date.now();
    const metrics = {
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
        const exactMatches = await findExactMatch(message);
        if (exactMatches.length > 0 && exactMatches.some(match => match.question.toLowerCase() === message.toLowerCase() ||
            match.question.toLowerCase() === message.toLowerCase() + '?')) {
            metrics.exactMatchFound = true;
            metrics.algorithmPath.push('exact_match');
            const results = exactMatches.map(qa => ({
                ...qa,
                similarity: 100,
                confidence: 100,
                matchType: 'exact',
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
            if (config.enableCaching)
                advancedCache.set(cacheKey, results);
            return { results, metrics };
        }
        const queryAnalysis = analyzeQuery(message);
        let results = await performAdvancedSearch(queryAnalysis, config);
        if (results.length > 1) {
            const diversityScore = calculateDiversityScore(results);
            metrics.diversityScore = diversityScore;
            if (diversityScore < 50) {
                results = applyDiversityFilter(results, config.diversityFactor);
                metrics.diversityScore = calculateDiversityScore(results);
            }
        }
        else {
            metrics.diversityScore = 100;
        }
        if (results.length === 0 && config.fallbackEnabled) {
            metrics.fallbackUsed = true;
            metrics.algorithmPath.push('fallback');
            const keywords = queryAnalysis.keywords;
            if (keywords.length > 0) {
                const fallbackResults = await findMatchByKeywords(keywords, config.limit);
                results = fallbackResults.map(qa => ({
                    ...qa,
                    similarity: Math.max(qa.score || 75, 75),
                    confidence: 80,
                    matchType: 'keyword',
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
        if (config.enableCaching)
            advancedCache.set(cacheKey, results);
        return { results: results.slice(0, config.limit), metrics };
    }
    catch (error) {
        logWithTimestamp(`Advanced search error: ${error}`, 'error');
        return { results: [], metrics };
    }
}
async function findRelevantQAPairsSimple(message, limit = 5) {
    const { results } = await findRelevantQAPairs(message, { ...exports.DEFAULT_CONFIG, limit });
    return results;
}
exports.default = findRelevantQAPairs;
