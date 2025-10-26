"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHistorySummary = buildHistorySummary;
exports.getPropertyNameFromHistory = getPropertyNameFromHistory;
exports.saveSearchHistory = saveSearchHistory;
const prisma_1 = require("../../../../lib/prisma");
async function buildHistorySummary(phoneNumber) {
    if (!phoneNumber)
        return { summary: "", clientId: undefined };
    const client = await prisma_1.prisma.client.findUnique({ where: { phoneNumber } });
    if (!client)
        return { summary: "", clientId: undefined };
    const [recentMessages, recentSearches] = await Promise.all([
        prisma_1.prisma.userMessageHistory.findMany({
            where: { clientId: client.id },
            orderBy: { createdAt: "desc" },
            take: 3,
        }),
        prisma_1.prisma.searchHistory.findMany({
            where: { clientId: client.id },
            orderBy: { createdAt: "desc" },
            take: 3,
        }),
    ]);
    const messagesSummary = recentMessages
        .map((m, i) => `رسالة ${i + 1}: ${m.message} (نوع الرد: ${m.responseType})`)
        .join("\n");
    const searchesSummary = recentSearches
        .map((h, i) => {
        let base = `بحث ${i + 1}: ${JSON.stringify(h.query)}`;
        if (h.propertyId)
            base += ` (propertyId: ${h.propertyId})`;
        return base;
    })
        .join("\n");
    const summary = [messagesSummary, searchesSummary].filter(Boolean).join("\n");
    return { summary, clientId: client.id };
}
function getPropertyNameFromHistory(historySummary) {
    const searchLines = historySummary.split('\n').filter(line => line.startsWith('بحث'));
    for (const line of searchLines) {
        const match = line.match(/بحث \d+: (\{.*\})/);
        if (match) {
            try {
                const query = JSON.parse(match[1]);
                if (typeof query.title === 'string' && query.title.trim()) {
                    return query.title.trim();
                }
                if (typeof query.type === 'string' && query.type.trim()) {
                    return query.type.trim();
                }
            }
            catch { }
        }
    }
    const messageLines = historySummary.split('\n').filter(line => line.startsWith('رسالة'));
    for (const line of messageLines) {
        const match = line.match(/رسالة \d+: ([^\(]+)/);
        if (match && match[1].trim()) {
            return match[1].trim();
        }
    }
    return undefined;
}
async function saveSearchHistory(clientId, query, properties) {
    if (properties.properties && properties.properties.length === 1) {
        await prisma_1.prisma.searchHistory.create({
            data: {
                clientId,
                query,
                propertyId: properties.properties[0].id,
                propertyName: properties.properties[0].title,
            },
        });
    }
    else {
        await prisma_1.prisma.searchHistory.create({
            data: { clientId, query },
        });
    }
}
