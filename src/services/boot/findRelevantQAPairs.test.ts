import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import findRelevantQAPairs, { 
  type QAPairWithSimilarity,
  type SearchConfig,
  DEFAULT_CONFIG
} from './findRelevantQAPairs';
import { prisma } from '../../lib/prisma';

// Mock prisma
jest.mock('../../lib/prisma', () => ({
  prisma: {
    qAPair: {
      findMany: jest.fn(),
      count: jest.fn()
    }
  }
}));

describe('findRelevantQAPairs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mock data
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

    (prisma.qAPair.findMany as any).mockResolvedValue(mockQAPairs);
    (prisma.qAPair.count as any).mockResolvedValue(mockQAPairs.length);
  });

  it('should find exact matches with high similarity', async () => {
    const query = 'How do I reset my password?';
    const { results, metrics } = await findRelevantQAPairs(query);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].similarity).toBeGreaterThanOrEqual(90);
    expect(results[0].confidence).toBeGreaterThanOrEqual(90);
    expect(metrics.exactMatchFound).toBe(true);
  });

  it('should find similar matches for partial queries', async () => {
    const query = 'forgot my password';
    const { results, metrics } = await findRelevantQAPairs(query);

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].similarity).toBeGreaterThan(75);
    expect(metrics.exactMatchFound).toBe(false);
  });

  it('should return empty results for irrelevant queries', async () => {
    (prisma.qAPair.findMany as any).mockResolvedValue([]);
    const query = 'completely unrelated query xyz123';
    const { results, metrics } = await findRelevantQAPairs(query);

    expect(results.length).toBe(0);
    expect(metrics.exactMatchFound).toBe(false);
    expect(metrics.fallbackUsed).toBe(true);
  });

  it('should respect custom search configuration', async () => {
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

    (prisma.qAPair.findMany as any).mockResolvedValue(mockQAs);
    
    const query = 'password reset';
    const customConfig: SearchConfig = {
      ...DEFAULT_CONFIG,
      limit: 2,
      minSimilarityThreshold: 80
    };

    const { results } = await findRelevantQAPairs(query, customConfig);

    expect(results.length).toBeLessThanOrEqual(2);
    results.forEach(result => {
      expect(result.similarity).toBeGreaterThanOrEqual(80);
    });
  });

  it('should handle and score structured answers better', async () => {
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

    (prisma.qAPair.findMany as any).mockResolvedValue([mockStructuredQA]);
    
    const query = 'payment options';
    const { results } = await findRelevantQAPairs(query);

    expect(results.length).toBeGreaterThan(0);
    const structuredResult = results[0];
    expect(structuredResult.answer).toContain('•');
    expect(structuredResult.relevanceFactors.contextualBoost).toBeGreaterThan(0.2);
  });

  it('should apply diversity filtering', async () => {
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

    (prisma.qAPair.findMany as any).mockResolvedValue(mockPasswordQAs);
    
    const query = 'password help';
    const { results, metrics } = await findRelevantQAPairs(query);

    // Check that similar questions about passwords have different scores
    const similarityScores = results.map(r => r.similarity);
    const uniqueScores = new Set(similarityScores);
    expect(uniqueScores.size).toBeGreaterThan(1);
    expect(metrics.diversityScore).toBeGreaterThan(50);
  });

  it('should handle errors gracefully', async () => {
    (prisma.qAPair.findMany as any).mockRejectedValue(new Error('Database error'));
    
    const query = 'test query';
    const { results, metrics } = await findRelevantQAPairs(query);

    expect(results).toEqual([]);
    expect(metrics.searchDuration).toBeDefined();
    expect(metrics.algorithmPath).toEqual([]);
  });

  it('should cache results when enabled', async () => {
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

    (prisma.qAPair.findMany as any).mockResolvedValue([mockQA]);
    
    const query = 'cached query test';
    await findRelevantQAPairs(query); // First call should cache
    (prisma.qAPair.findMany as any).mockClear(); // Clear mock calls
    const { results, metrics } = await findRelevantQAPairs(query); // Second call should use cache

    expect(results.length).toBeGreaterThan(0);
    expect(metrics.algorithmPath).toContain('cache');
    expect(prisma.qAPair.findMany).not.toHaveBeenCalled();
  });

  it('should calculate correct relevance factors', async () => {
    const query = 'How to reset my password securely?';
    const { results } = await findRelevantQAPairs(query);

    const topResult = results[0];
    expect(topResult.relevanceFactors).toMatchObject({
      semanticScore: expect.any(Number),
      keywordOverlap: expect.any(Number),
      categoryRelevance: expect.any(Number),
      tagRelevance: expect.any(Number),
      lengthSimilarity: expect.any(Number),
      structuralSimilarity: expect.any(Number),
      contextualBoost: expect.any(Number)
    });

    // Verify relevance factors are within expected ranges
    Object.values(topResult.relevanceFactors).forEach(factor => {
      expect(factor).toBeGreaterThanOrEqual(0);
      expect(factor).toBeLessThanOrEqual(1);
    });
  });
}); 