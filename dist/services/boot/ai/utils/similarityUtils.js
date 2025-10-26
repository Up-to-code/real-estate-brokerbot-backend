"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSimilarityScore = getSimilarityScore;
function getSimilarityScore(a, b) {
    if (!a || !b)
        return 0;
    a = a.trim().toLowerCase();
    b = b.trim().toLowerCase();
    if (a === b)
        return 1;
    const aWords = new Set(a.split(/\s+/));
    const bWords = new Set(b.split(/\s+/));
    const shared = [...aWords].filter(w => bWords.has(w)).length;
    const total = new Set([...aWords, ...bWords]).size;
    return total ? shared / total : 0;
}
