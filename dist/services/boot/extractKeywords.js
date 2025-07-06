"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractKeywords = extractKeywords;
exports.extractKeywordsSimple = extractKeywordsSimple;
exports.extractRelevantKeywords = extractRelevantKeywords;
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
const DEFAULT_CONFIG = {
    maxKeywords: 5,
    minSimilarityThreshold: 90,
    supportedLanguages: ["ar", "en"],
    minKeywordLength: 2,
    contextWeight: 0.3,
};
function detectLanguage(text) {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;
    const englishRegex = /[a-zA-Z]/g;
    const arabicMatches = (text.match(arabicRegex) || []).length;
    const englishMatches = (text.match(englishRegex) || []).length;
    const totalChars = arabicMatches + englishMatches;
    if (totalChars === 0)
        return "en";
    const arabicRatio = arabicMatches / totalChars;
    if (arabicRatio > 0.7)
        return "ar";
    if (arabicRatio < 0.3)
        return "en";
    return "mixed";
}
function normalizeArabicText(text) {
    return (text
        .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
        .replace(/[إأآا]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/[يى]/g, "ي")
        .replace(/ـ/g, ""));
}
function tokenizeText(text, language) {
    if (language === "ar") {
        const normalized = normalizeArabicText(text);
        return normalized
            .split(/[\s\u060C\u061B\u061F\u0640]+/)
            .filter((token) => token.length > 0);
    }
    return text
        .toLowerCase()
        .split(/[\s\W]+/)
        .filter((token) => token.length > 0);
}
function removeStopWords(tokens, language) {
    let stopWords;
    if (language === "ar") {
        stopWords = ARABIC_STOP_WORDS;
    }
    else if (language === "en") {
        stopWords = ENGLISH_STOP_WORDS;
    }
    else {
        stopWords = new Set([...ARABIC_STOP_WORDS, ...ENGLISH_STOP_WORDS]);
    }
    return tokens.filter((token) => !stopWords.has(token));
}
function calculateTermFrequency(tokens) {
    const frequency = new Map();
    tokens.forEach((token) => {
        frequency.set(token, (frequency.get(token) || 0) + 1);
    });
    return frequency;
}
function calculateKeywordScore(keyword, frequency, totalTokens, positions, originalText) {
    const tfScore = frequency / totalTokens;
    const avgPosition = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
    const positionScore = Math.max(0, 1 - avgPosition / totalTokens);
    const lengthScore = Math.min(1, keyword.length / 8);
    const capitalizationScore = /^[A-Z]/.test(keyword) ? 0.2 : 0;
    return (tfScore * 0.4 +
        positionScore * 0.3 +
        lengthScore * 0.2 +
        capitalizationScore * 0.1);
}
function calculateSimilarity(text1, text2) {
    const tokens1 = new Set(text1.toLowerCase().split(/\s+/));
    const tokens2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...tokens1].filter((x) => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
}
function extractCompoundKeywords(tokens, minFreq = 2) {
    const compounds = new Map();
    for (let i = 0; i < tokens.length - 1; i++) {
        const bigram = `${tokens[i]} ${tokens[i + 1]}`;
        compounds.set(bigram, (compounds.get(bigram) || 0) + 1);
    }
    for (let i = 0; i < tokens.length - 2; i++) {
        const trigram = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`;
        compounds.set(trigram, (compounds.get(trigram) || 0) + 1);
    }
    return Array.from(compounds.entries())
        .filter(([_, freq]) => freq >= minFreq)
        .sort((a, b) => b[1] - a[1])
        .map(([compound]) => compound);
}
function extractKeywords(text, maxKeywords = 5, referenceText, config = {}) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config, maxKeywords };
    if (!text || text.trim().length === 0) {
        return null;
    }
    try {
        const language = detectLanguage(text);
        if (referenceText && finalConfig.minSimilarityThreshold > 0) {
            const similarity = calculateSimilarity(text, referenceText);
            if (similarity < finalConfig.minSimilarityThreshold) {
                return null;
            }
        }
        const tokens = tokenizeText(text, language);
        if (tokens.length === 0)
            return null;
        const filteredTokens = removeStopWords(tokens, language);
        if (filteredTokens.length === 0)
            return null;
        const termFreq = calculateTermFrequency(filteredTokens);
        const keywordResults = [];
        Array.from(termFreq.entries()).forEach(([term, frequency]) => {
            if (term.length >= finalConfig.minKeywordLength) {
                const positions = [];
                tokens.forEach((token, index) => {
                    if (token === term)
                        positions.push(index);
                });
                const score = calculateKeywordScore(term, frequency, tokens.length, positions, text);
                let similarity = 100;
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
        const compounds = extractCompoundKeywords(filteredTokens, 2);
        compounds.slice(0, Math.floor(maxKeywords / 2)).forEach((compound) => {
            let similarity = 100;
            if (referenceText) {
                similarity = calculateSimilarity(compound, referenceText);
            }
            keywordResults.push({
                keyword: compound,
                score: 0.8,
                similarity,
                language,
                isRelevant: similarity >= finalConfig.minSimilarityThreshold,
            });
        });
        const relevantKeywords = keywordResults
            .filter((kw) => kw.isRelevant)
            .sort((a, b) => {
            if (Math.abs(b.similarity - a.similarity) > 5) {
                return b.similarity - a.similarity;
            }
            return b.score - a.score;
        })
            .slice(0, maxKeywords);
        if (relevantKeywords.length === 0 &&
            finalConfig.minSimilarityThreshold >= 90) {
            return null;
        }
        return relevantKeywords.length > 0 ? relevantKeywords : null;
    }
    catch (error) {
        console.error("Error in keyword extraction:", error);
        return null;
    }
}
function extractKeywordsSimple(text, count = 5) {
    const results = extractKeywords(text, count);
    return results ? results.map((r) => r.keyword) : [];
}
function extractRelevantKeywords(text, referenceText, maxKeywords = 5, minSimilarity = 90) {
    return extractKeywords(text, maxKeywords, referenceText, {
        minSimilarityThreshold: minSimilarity,
    });
}
