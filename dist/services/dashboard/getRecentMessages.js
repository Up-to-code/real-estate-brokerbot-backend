"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentMessages = void 0;
const prisma_1 = require("../../lib/prisma");
const date_utils_1 = require("../../lib/date-utils");
const getRecentMessages = async () => {
    const messages = await prisma_1.prisma.message.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
    });
    const result = messages.map((msg) => ({
        user: "System",
        action: msg.isBot ? "Bot" : "User",
        message: msg.text,
        time: (0, date_utils_1.formatRelativeTime)(msg.createdAt),
    }));
    return result;
};
exports.getRecentMessages = getRecentMessages;
