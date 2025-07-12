import { prisma } from '../../../../lib/prisma';

/**
 * buildHistorySummary
 * Helper to build user history summary for LLM context.
 */
export async function buildHistorySummary(phoneNumber?: string): Promise<{ summary: string; clientId?: string }> {
  if (!phoneNumber) return { summary: "", clientId: undefined };
  const client = await prisma.client.findUnique({ where: { phoneNumber } });
  if (!client) return { summary: "", clientId: undefined };

  const [recentMessages, recentSearches] = await Promise.all([
    prisma.userMessageHistory.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.searchHistory.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const messagesSummary = recentMessages
    .map((m, i) => `رسالة ${i + 1}: ${m.message} (نوع الرد: ${m.responseType})`)
    .join("\n");
  const searchesSummary = recentSearches
    .map((h, i) => `بحث ${i + 1}: ${JSON.stringify(h.query)}`)
    .join("\n");
  const summary = [messagesSummary, searchesSummary].filter(Boolean).join("\n");
  return { summary, clientId: client.id };
}

/**
 * getPropertyNameFromHistory
 * Extracts the most recent property name from the history summary.
 * Looks for property names in 'بحث' lines or in JSON query objects.
 */
export function getPropertyNameFromHistory(historySummary: string): string | undefined {
  // Try to extract from 'بحث' lines (searches)
  const searchLines = historySummary.split('\n').filter(line => line.startsWith('بحث'));
  for (const line of searchLines) {
    // Try to parse JSON after the colon
    const match = line.match(/بحث \d+: (\{.*\})/);
    if (match) {
      try {
        const query = JSON.parse(match[1]);
        // Try to get title or type as property name
        if (typeof query.title === 'string' && query.title.trim()) {
          return query.title.trim();
        }
        if (typeof query.type === 'string' && query.type.trim()) {
          return query.type.trim();
        }
      } catch {}
    }
  }
  // Fallback: Try to extract from 'رسالة' lines
  const messageLines = historySummary.split('\n').filter(line => line.startsWith('رسالة'));
  for (const line of messageLines) {
    // Heuristic: look for quoted text or after colon
    const match = line.match(/رسالة \d+: ([^\(]+)/);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
  }
  return undefined;
} 