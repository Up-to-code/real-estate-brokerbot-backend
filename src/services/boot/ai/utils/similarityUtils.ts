/**
 * getSimilarityScore
 * Returns a similarity score between two strings (0 to 1).
 */
export function getSimilarityScore(a: string, b: string): number {
  if (!a || !b) return 0;
  a = a.trim().toLowerCase();
  b = b.trim().toLowerCase();
  if (a === b) return 1;
  // Simple overlap: number of shared words / total unique words
  const aWords = new Set(a.split(/\s+/));
  const bWords = new Set(b.split(/\s+/));
  const shared = [...aWords].filter(w => bWords.has(w)).length;
  const total = new Set([...aWords, ...bWords]).size;
  return total ? shared / total : 0;
} 