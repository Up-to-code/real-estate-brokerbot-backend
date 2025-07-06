"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const findRelevantQAPairs_1 = __importStar(require("./findRelevantQAPairs"));
const prisma_1 = require("../../lib/prisma");
globals_1.jest.mock('../../lib/prisma', () => ({
    prisma: {
        qAPair: {
            findMany: globals_1.jest.fn(),
            count: globals_1.jest.fn()
        }
    }
}));
(0, globals_1.describe)('findRelevantQAPairs', () => {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        const mockQAPairs = [
            {
                id: '1',
                question: 'How do I reset my password?',
                answer: 'To reset your password, follow these steps:\n1. Click on "Forgot Password"\n2. Enter your email\n3. Follow the instructions sent to your email',
                category: 'account',
                language: 'en',
                tags: ['password', 'account', 'security'],
                priority: 5,
                isActive: true,
                createdAt: new Date()
            },
            {
                id: '2',
                question: 'What payment methods do you accept?',
                answer: 'We accept the following payment methods:\n• Credit Cards (Visa, MasterCard)\n• PayPal\n• Bank Transfer',
                category: 'billing',
                language: 'en',
                tags: ['payment', 'billing'],
                priority: 4,
                isActive: true,
                createdAt: new Date()
            },
            {
                id: '3',
                question: 'How to change password?',
                answer: 'You can change your password in account settings. Click on profile, then security.',
                category: 'account',
                language: 'en',
                tags: ['password', 'account', 'security'],
                priority: 3,
                isActive: true,
                createdAt: new Date()
            }
        ];
        prisma_1.prisma.qAPair.findMany.mockResolvedValue(mockQAPairs);
        prisma_1.prisma.qAPair.count.mockResolvedValue(mockQAPairs.length);
    });
    (0, globals_1.it)('should find exact matches with high similarity', async () => {
        const query = 'How do I reset my password?';
        const { results, metrics } = await (0, findRelevantQAPairs_1.default)(query);
        (0, globals_1.expect)(results.length).toBeGreaterThan(0);
        (0, globals_1.expect)(results[0].similarity).toBeGreaterThanOrEqual(90);
        (0, globals_1.expect)(results[0].confidence).toBeGreaterThanOrEqual(90);
        (0, globals_1.expect)(metrics.exactMatchFound).toBe(true);
    });
    (0, globals_1.it)('should find similar matches for partial queries', async () => {
        const query = 'forgot my password';
        const { results, metrics } = await (0, findRelevantQAPairs_1.default)(query);
        (0, globals_1.expect)(results.length).toBeGreaterThan(0);
        (0, globals_1.expect)(results[0].similarity).toBeGreaterThan(75);
        (0, globals_1.expect)(metrics.exactMatchFound).toBe(false);
    });
    (0, globals_1.it)('should return empty results for irrelevant queries', async () => {
        prisma_1.prisma.qAPair.findMany.mockResolvedValue([]);
        const query = 'completely unrelated query xyz123';
        const { results, metrics } = await (0, findRelevantQAPairs_1.default)(query);
        (0, globals_1.expect)(results.length).toBe(0);
        (0, globals_1.expect)(metrics.exactMatchFound).toBe(false);
        (0, globals_1.expect)(metrics.fallbackUsed).toBe(true);
    });
    (0, globals_1.it)('should respect custom search configuration', async () => {
        const mockQAs = [
            {
                id: '3',
                question: 'How to reset password?',
                answer: 'Click forgot password and follow email instructions.',
                category: 'account',
                language: 'en',
                tags: ['password', 'account'],
                priority: 5,
                isActive: true,
                createdAt: new Date()
            },
            {
                id: '4',
                question: 'Password reset instructions',
                answer: 'Follow these steps to reset your password...',
                category: 'account',
                language: 'en',
                tags: ['password', 'account'],
                priority: 4,
                isActive: true,
                createdAt: new Date()
            }
        ];
        prisma_1.prisma.qAPair.findMany.mockResolvedValue(mockQAs);
        const query = 'password reset';
        const customConfig = {
            ...findRelevantQAPairs_1.DEFAULT_CONFIG,
            limit: 2,
            minSimilarityThreshold: 80
        };
        const { results } = await (0, findRelevantQAPairs_1.default)(query, customConfig);
        (0, globals_1.expect)(results.length).toBeLessThanOrEqual(2);
        results.forEach(result => {
            (0, globals_1.expect)(result.similarity).toBeGreaterThanOrEqual(80);
        });
    });
    (0, globals_1.it)('should handle and score structured answers better', async () => {
        const mockStructuredQA = {
            id: '4',
            question: 'What are the payment options?',
            answer: 'We accept these payment methods:\n\n1. Credit Cards (Visa, MasterCard)\n2. PayPal\n3. Bank Transfer\n\nFor example, you can use any major credit card. Here are some details:\n\n• Visa and MasterCard accepted worldwide\n• PayPal for secure online transactions\n• Bank transfers for large amounts',
            category: 'billing',
            language: 'en',
            tags: ['payment', 'billing'],
            priority: 5,
            isActive: true,
            createdAt: new Date()
        };
        prisma_1.prisma.qAPair.findMany.mockResolvedValue([mockStructuredQA]);
        const query = 'payment options';
        const { results } = await (0, findRelevantQAPairs_1.default)(query);
        (0, globals_1.expect)(results.length).toBeGreaterThan(0);
        const structuredResult = results[0];
        (0, globals_1.expect)(structuredResult.answer).toContain('•');
        (0, globals_1.expect)(structuredResult.relevanceFactors.contextualBoost).toBeGreaterThan(0.2);
    });
    (0, globals_1.it)('should apply diversity filtering', async () => {
        const mockPasswordQAs = [
            {
                id: '5',
                question: 'How to reset password?',
                answer: 'Click forgot password and follow email instructions.',
                category: 'account',
                language: 'en',
                tags: ['password', 'account'],
                priority: 5,
                isActive: true,
                createdAt: new Date()
            },
            {
                id: '6',
                question: 'Where to change password?',
                answer: 'Go to account settings to change password.',
                category: 'account',
                language: 'en',
                tags: ['password', 'account'],
                priority: 4,
                isActive: true,
                createdAt: new Date()
            },
            {
                id: '7',
                question: 'Password requirements?',
                answer: 'Password must be 8 characters with numbers.',
                category: 'security',
                language: 'en',
                tags: ['password', 'security'],
                priority: 3,
                isActive: true,
                createdAt: new Date()
            }
        ];
        prisma_1.prisma.qAPair.findMany.mockResolvedValue(mockPasswordQAs);
        const query = 'password help';
        const { results, metrics } = await (0, findRelevantQAPairs_1.default)(query);
        const similarityScores = results.map(r => r.similarity);
        const uniqueScores = new Set(similarityScores);
        (0, globals_1.expect)(uniqueScores.size).toBeGreaterThan(1);
        (0, globals_1.expect)(metrics.diversityScore).toBeGreaterThan(50);
    });
    (0, globals_1.it)('should handle errors gracefully', async () => {
        prisma_1.prisma.qAPair.findMany.mockRejectedValue(new Error('Database error'));
        const query = 'test query';
        const { results, metrics } = await (0, findRelevantQAPairs_1.default)(query);
        (0, globals_1.expect)(results).toEqual([]);
        (0, globals_1.expect)(metrics.searchDuration).toBeDefined();
        (0, globals_1.expect)(metrics.algorithmPath).toEqual([]);
    });
    (0, globals_1.it)('should cache results when enabled', async () => {
        const mockQA = {
            id: '8',
            question: 'Cached question',
            answer: 'Cached answer',
            category: 'test',
            language: 'en',
            tags: ['test'],
            priority: 1,
            isActive: true,
            createdAt: new Date()
        };
        prisma_1.prisma.qAPair.findMany.mockResolvedValue([mockQA]);
        const query = 'cached query test';
        await (0, findRelevantQAPairs_1.default)(query);
        prisma_1.prisma.qAPair.findMany.mockClear();
        const { results, metrics } = await (0, findRelevantQAPairs_1.default)(query);
        (0, globals_1.expect)(results.length).toBeGreaterThan(0);
        (0, globals_1.expect)(metrics.algorithmPath).toContain('cache');
        (0, globals_1.expect)(prisma_1.prisma.qAPair.findMany).not.toHaveBeenCalled();
    });
    (0, globals_1.it)('should calculate correct relevance factors', async () => {
        const query = 'How to reset my password securely?';
        const { results } = await (0, findRelevantQAPairs_1.default)(query);
        const topResult = results[0];
        (0, globals_1.expect)(topResult.relevanceFactors).toMatchObject({
            semanticScore: globals_1.expect.any(Number),
            keywordOverlap: globals_1.expect.any(Number),
            categoryRelevance: globals_1.expect.any(Number),
            tagRelevance: globals_1.expect.any(Number),
            lengthSimilarity: globals_1.expect.any(Number),
            structuralSimilarity: globals_1.expect.any(Number),
            contextualBoost: globals_1.expect.any(Number)
        });
        Object.values(topResult.relevanceFactors).forEach(factor => {
            (0, globals_1.expect)(factor).toBeGreaterThanOrEqual(0);
            (0, globals_1.expect)(factor).toBeLessThanOrEqual(1);
        });
    });
});
