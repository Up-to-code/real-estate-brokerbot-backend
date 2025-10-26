"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendText = sendText;
exports.getDailyMessageStats = getDailyMessageStats;
exports.resetDailyMessageCount = resetDailyMessageCount;
exports.cleanupOldMessageStats = cleanupOldMessageStats;
const httpClient_1 = require("./httpClient");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const DAILY_MESSAGE_LIMIT = 1000;
async function getTodayStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let stat = await prisma.dailyMessageStat.findUnique({
        where: { date: today }
    });
    if (!stat) {
        stat = await prisma.dailyMessageStat.create({
            data: {
                date: today,
                count: 0
            }
        });
    }
    return { id: stat.id, count: stat.count };
}
async function checkDailyLimit() {
    const stats = await getTodayStats();
    const remaining = DAILY_MESSAGE_LIMIT - stats.count;
    return {
        canSend: remaining > 0,
        remaining: Math.max(0, remaining)
    };
}
async function incrementMessageCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.dailyMessageStat.upsert({
        where: { date: today },
        update: { count: { increment: 1 } },
        create: {
            date: today,
            count: 1
        }
    });
}
async function sendText(config, to, message, options = {}) {
    const limitCheck = await checkDailyLimit();
    if (!limitCheck.canSend) {
        throw new Error(`Daily message limit of ${DAILY_MESSAGE_LIMIT} reached. Try again tomorrow.`);
    }
    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: {
            preview_url: options.previewUrl || false,
            body: message
        }
    };
    if (options.replyToMessageId) {
        payload.context = { message_id: options.replyToMessageId };
    }
    try {
        const response = await (0, httpClient_1.makeApiRequest)(config, 'messages', payload);
        if (response.messages && response.messages.length > 0) {
            await incrementMessageCount();
        }
        return response;
    }
    catch (error) {
        throw error;
    }
}
async function getDailyMessageStats() {
    const stats = await getTodayStats();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return {
        sent: stats.count,
        remaining: Math.max(0, DAILY_MESSAGE_LIMIT - stats.count),
        limit: DAILY_MESSAGE_LIMIT,
        resetTime: tomorrow
    };
}
async function resetDailyMessageCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.dailyMessageStat.upsert({
        where: { date: today },
        update: { count: 0 },
        create: {
            date: today,
            count: 0
        }
    });
}
async function cleanupOldMessageStats(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    await prisma.dailyMessageStat.deleteMany({
        where: {
            date: {
                lt: cutoffDate
            }
        }
    });
}
