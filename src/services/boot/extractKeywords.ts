/**
 * Smart Multilingual Keyword Extractor
 * Supports Arabic and English with similarity threshold checking
 */

interface KeywordResult {
  keyword: string;
  score: number;
  similarity: number;
  language: "ar" | "en" | "mixed";
  isRelevant: boolean;
}

interface ExtractionConfig {
  maxKeywords: number;
  minSimilarityThreshold: number; // 90% default
  supportedLanguages: ("ar" | "en")[];
  minKeywordLength: number;
  contextWeight: number;
}

// Arabic stop words
const ARABIC_STOP_WORDS = new Set([
  "في",
  "من",
  "إلى",
  "على",
  "عن",
  "مع",
  "هذا",
  "هذه",
  "ذلك",
  "تلك",
  "التي",
  "الذي",
  "التي",
  "اللذان",
  "اللتان",
  "الذين",
  "اللاتي",
  "اللواتي",
  "كان",
  "كانت",
  "كانوا",
  "كن",
  "يكون",
  "تكون",
  "أكون",
  "نكون",
  "يكونوا",
  "تكن",
  "هو",
  "هي",
  "هم",
  "هن",
  "أنت",
  "أنتم",
  "أنتن",
  "أنا",
  "نحن",
  "إياه",
  "إياها",
  "إياهم",
  "إياهن",
  "إياي",
  "إيانا",
  "إياك",
  "إياكم",
  "إياكن",
  "له",
  "لها",
  "لهم",
  "لهن",
  "لي",
  "لك",
  "لكم",
  "لكن",
  "لنا",
  "عندما",
  "حيث",
  "كيف",
  "ماذا",
  "متى",
  "أين",
  "لماذا",
  "كم",
  "أي",
  "بعد",
  "قبل",
  "عند",
  "عندما",
  "لكن",
  "لكن",
  "غير",
  "سوى",
  "إلا",
  "بل",
  "لا",
  "ما",
  "لم",
  "لن",
  "ليس",
  "ليست",
  "ليسوا",
  "لسن",
  "قد",
  "لقد",
  "كلا",
  "كلتا",
  "جميع",
  "كل",
  "بعض",
  "معظم",
  "أكثر",
  "أقل",
  "جدا",
  "كثيرا",
  "قليلا",
  "أيضا",
  "كذلك",
  "هكذا",
  "هناك",
  "هنا",
  "حول",
  "خلال",
  "عبر",
  "ضد",
  "نحو",
  "تجاه",
  "بين",
  "أمام",
  "خلف",
  "فوق",
  "تحت",
  "يمين",
  "يسار",
  "داخل",
  "خارج",
  "قريب",
  "بعيد",
  "جانب",
  "وسط",
  "بداية",
  "نهاية",
  "أول",
  "آخر",
  "التالي",
  "السابق",
]);

// English stop words (simplified)
const ENGLISH_STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "up",
  "about",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "among",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "can",
  "shall",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "me",
  "him",
  "her",
  "us",
  "them",
  "my",
  "your",
  "his",
  "her",
  "its",
  "our",
  "their",
  "what",
  "which",
  "who",
  "whom",
  "whose",
  "where",
  "when",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "now",
]);

const DEFAULT_CONFIG: ExtractionConfig = {
  maxKeywords: 5,
  minSimilarityThreshold: 90,
  supportedLanguages: ["ar", "en"],
  minKeywordLength: 2,
  contextWeight: 0.3,
};

/**
 * Detects the primary language of the text
 */
function detectLanguage(text: string): "ar" | "en" | "mixed" {
  // Arabic Unicode ranges
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;
  const englishRegex = /[a-zA-Z]/g;

  const arabicMatches = (text.match(arabicRegex) || []).length;
  const englishMatches = (text.match(englishRegex) || []).length;

  const totalChars = arabicMatches + englishMatches;
  if (totalChars === 0) return "en"; // Default to English

  const arabicRatio = arabicMatches / totalChars;

  if (arabicRatio > 0.7) return "ar";
  if (arabicRatio < 0.3) return "en";
  return "mixed";
}

/**
 * Normalizes Arabic text for better processing
 */
function normalizeArabicText(text: string): string {
  return (
    text
      // Remove diacritics
      .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
      // Normalize Alef variants
      .replace(/[إأآا]/g, "ا")
      // Normalize Teh Marbuta
      .replace(/ة/g, "ه")
      // Normalize Yeh variants
      .replace(/[يى]/g, "ي")
      // Remove Tatweel
      .replace(/ـ/g, "")
  );
}

/**
 * Tokenizes text based on language
 */
function tokenizeText(text: string, language: "ar" | "en" | "mixed"): string[] {
  if (language === "ar") {
    const normalized = normalizeArabicText(text);
    return normalized
      .split(/[\s\u060C\u061B\u061F\u0640]+/) // Arabic punctuation
      .filter((token) => token.length > 0);
  }

  // English or mixed
  return text
    .toLowerCase()
    .split(/[\s\W]+/)
    .filter((token) => token.length > 0);
}

/**
 * Removes stop words based on language
 */
function removeStopWords(
  tokens: string[],
  language: "ar" | "en" | "mixed"
): string[] {
  let stopWords: Set<string>;

  if (language === "ar") {
    stopWords = ARABIC_STOP_WORDS;
  } else if (language === "en") {
    stopWords = ENGLISH_STOP_WORDS;
  } else {
    // Mixed: use both
    stopWords = new Set([...ARABIC_STOP_WORDS, ...ENGLISH_STOP_WORDS]);
  }

  return tokens.filter((token) => !stopWords.has(token));
}

/**
 * Calculates term frequency
 */
function calculateTermFrequency(tokens: string[]): Map<string, number> {
  const frequency = new Map<string, number>();

  tokens.forEach((token) => {
    frequency.set(token, (frequency.get(token) || 0) + 1);
  });

  return frequency;
}

/**
 * Calculates keyword relevance score
 */
function calculateKeywordScore(
  keyword: string,
  frequency: number,
  totalTokens: number,
  positions: number[],
  originalText: string
): number {
  // Base frequency score
  const tfScore = frequency / totalTokens;

  // Position bonus (keywords at beginning get higher score)
  const avgPosition =
    positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
  const positionScore = Math.max(0, 1 - avgPosition / totalTokens);

  // Length bonus (moderate length preferred)
  const lengthScore = Math.min(1, keyword.length / 8);

  // Capitalization bonus for English
  const capitalizationScore = /^[A-Z]/.test(keyword) ? 0.2 : 0;

  return (
    tfScore * 0.4 +
    positionScore * 0.3 +
    lengthScore * 0.2 +
    capitalizationScore * 0.1
  );
}

/**
 * Simple similarity calculation using Jaccard index
 */
function calculateSimilarity(text1: string, text2: string): number {
  const tokens1 = new Set(text1.toLowerCase().split(/\s+/));
  const tokens2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...tokens1].filter((x) => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
}

/**
 * Extracts compound keywords (2-3 word phrases)
 */
function extractCompoundKeywords(
  tokens: string[],
  minFreq: number = 2
): string[] {
  const compounds: Map<string, number> = new Map();

  // Extract 2-grams
  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = `${tokens[i]} ${tokens[i + 1]}`;
    compounds.set(bigram, (compounds.get(bigram) || 0) + 1);
  }

  // Extract 3-grams
  for (let i = 0; i < tokens.length - 2; i++) {
    const trigram = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`;
    compounds.set(trigram, (compounds.get(trigram) || 0) + 1);
  }

  return Array.from(compounds.entries())
    .filter(([_, freq]) => freq >= minFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([compound]) => compound);
}

/**
 * Main keyword extraction function with similarity check
 */
export function extractKeywords(
  text: string,
  maxKeywords: number = 5,
  referenceText?: string,
  config: Partial<ExtractionConfig> = {}
): KeywordResult[] | null {
  const finalConfig = { ...DEFAULT_CONFIG, ...config, maxKeywords };

  if (!text || text.trim().length === 0) {
    return null;
  }

  try {
    // Detect language
    const language = detectLanguage(text);

    // If similarity check is needed and reference text is provided
    if (referenceText && finalConfig.minSimilarityThreshold > 0) {
      const similarity = calculateSimilarity(text, referenceText);
      if (similarity < finalConfig.minSimilarityThreshold) {
        return null; // Below threshold, return null
      }
    }

    // Tokenize text
    const tokens = tokenizeText(text, language);
    if (tokens.length === 0) return null;

    // Remove stop words
    const filteredTokens = removeStopWords(tokens, language);
    if (filteredTokens.length === 0) return null;

    // Calculate term frequencies
    const termFreq = calculateTermFrequency(filteredTokens);

    // Create keyword results for single terms
    const keywordResults: KeywordResult[] = [];

    Array.from(termFreq.entries()).forEach(([term, frequency]) => {
      if (term.length >= finalConfig.minKeywordLength) {
        // Find positions of this term
        const positions: number[] = [];
        tokens.forEach((token, index) => {
          if (token === term) positions.push(index);
        });

        const score = calculateKeywordScore(
          term,
          frequency,
          tokens.length,
          positions,
          text
        );

        // Calculate similarity with reference text if provided
        let similarity = 100; // Default high similarity
        if (referenceText) {
          similarity = calculateSimilarity(term, referenceText);
        }

        keywordResults.push({
          keyword: term,
          score,
          similarity,
          language,
          isRelevant: similarity >= finalConfig.minSimilarityThreshold,
        });
      }
    });

    // Add compound keywords if they exist
    const compounds = extractCompoundKeywords(filteredTokens, 2);
    compounds.slice(0, Math.floor(maxKeywords / 2)).forEach((compound) => {
      let similarity = 100;
      if (referenceText) {
        similarity = calculateSimilarity(compound, referenceText);
      }

      keywordResults.push({
        keyword: compound,
        score: 0.8, // Slightly lower base score for compounds
        similarity,
        language,
        isRelevant: similarity >= finalConfig.minSimilarityThreshold,
      });
    });

    // Filter by relevance and sort by score
    const relevantKeywords = keywordResults
      .filter((kw) => kw.isRelevant)
      .sort((a, b) => {
        // Primary sort by similarity
        if (Math.abs(b.similarity - a.similarity) > 5) {
          return b.similarity - a.similarity;
        }
        // Secondary sort by score
        return b.score - a.score;
      })
      .slice(0, maxKeywords);

    // If no relevant keywords found and similarity threshold is high, return null
    if (
      relevantKeywords.length === 0 &&
      finalConfig.minSimilarityThreshold >= 90
    ) {
      return null;
    }

    return relevantKeywords.length > 0 ? relevantKeywords : null;
  } catch (error) {
    console.error("Error in keyword extraction:", error);
    return null;
  }
}

/**
 * Simple wrapper for backward compatibility
 */
export function extractKeywordsSimple(
  text: string,
  count: number = 5
): string[] {
  const results = extractKeywords(text, count);
  return results ? results.map((r) => r.keyword) : [];
}

/**
 * Advanced extraction with similarity filtering
 */
export function extractRelevantKeywords(
  text: string,
  referenceText: string,
  maxKeywords: number = 5,
  minSimilarity: number = 90
): KeywordResult[] | null {
  return extractKeywords(text, maxKeywords, referenceText, {
    minSimilarityThreshold: minSimilarity,
  });
}

export { type KeywordResult, type ExtractionConfig };
