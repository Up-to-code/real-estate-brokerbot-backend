"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../lib/prisma");
const safeQuery_1 = __importDefault(require("../../lib/prisma/safeQuery"));
const DailyMessages_1 = require("../../services/dashboard/DailyMessages");
const getRecentMessages_1 = require("../../services/dashboard/getRecentMessages");
async function getDashboardStatistics() {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [totalClients, totalMessages, activeCampaigns, activeClients] = await Promise.all([
            (0, safeQuery_1.default)(prisma_1.prisma.client.count(), 0),
            (0, safeQuery_1.default)(prisma_1.prisma.message.count(), 0),
            (0, safeQuery_1.default)(prisma_1.prisma.campaign.count({ where: { status: "Active" } }), 0),
            (0, safeQuery_1.default)(prisma_1.prisma.client.count({
                where: { lastActive: { gte: thirtyDaysAgo } },
            }), 0),
        ]);
        const RecentMessages = await (0, getRecentMessages_1.getRecentMessages)();
        const DailyMessages = (0, DailyMessages_1.getDailyMessagesThisMonth)();
        return {
            totalClients,
            totalMessages,
            activeCampaigns,
            activeClients,
            RecentMessages,
            DailyMessages,
        };
    }
    catch (error) {
        throw new Error("Failed to fetch dashboard statistics");
    }
}
exports.default = getDashboardStatistics;
