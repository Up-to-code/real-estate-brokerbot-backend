"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYearlyStats = exports.getMonthlyStats = exports.getDailyMessagesThisMonth = exports.updateDailyMessagesCount = void 0;
const date_fns_1 = require("date-fns");
const prisma_1 = require("../../lib/prisma");
const updateDailyMessagesCount = async (req, res) => {
    const today = new Date();
    const start = (0, date_fns_1.startOfDay)(today);
    const end = (0, date_fns_1.endOfDay)(today);
    const count = await prisma_1.prisma.message.count({
        where: { createdAt: { gte: start, lte: end } },
    });
    await prisma_1.prisma.dailyMessageStat.upsert({
        where: { date: start },
        update: { count },
        create: { date: start, count },
    });
    res.json({ message: "تم تحديث عدد الرسائل", count });
};
exports.updateDailyMessagesCount = updateDailyMessagesCount;
const getDailyMessagesThisMonth = async () => {
    const start = (0, date_fns_1.startOfMonth)(new Date());
    const end = (0, date_fns_1.endOfMonth)(new Date());
    const data = await prisma_1.prisma.dailyMessageStat.findMany({
        where: { date: { gte: start, lte: end } },
        orderBy: { date: "asc" },
    });
    return data;
};
exports.getDailyMessagesThisMonth = getDailyMessagesThisMonth;
const getMonthlyStats = async (_, res) => {
    const start = (0, date_fns_1.startOfYear)(new Date());
    const end = (0, date_fns_1.endOfYear)(new Date());
    const data = await prisma_1.prisma.$queryRaw `SELECT EXTRACT(MONTH FROM date) as month, SUM(count)::int as total
     FROM "DailyMessageStat"
     WHERE date BETWEEN ${start} AND ${end}
     GROUP BY month ORDER BY month ASC;`;
    res.json(data);
};
exports.getMonthlyStats = getMonthlyStats;
const getYearlyStats = async (_, res) => {
    const data = await prisma_1.prisma.$queryRaw `SELECT EXTRACT(YEAR FROM date) as year, SUM(count)::int as total
     FROM "DailyMessageStat"
     GROUP BY year ORDER BY year ASC;`;
    res.json(data);
};
exports.getYearlyStats = getYearlyStats;
