// src/controllers/message.controller.ts
import { prisma } from "../../lib/prisma";
import { formatRelativeTime } from "../../lib/date-utils";

export const getRecentMessages = async () => {
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const result = messages.map((msg) => ({
    user: "System", // عدل حسب الـ user لو عندك
    action: msg.isBot ? "Bot" : "User",
    message: msg.text,
    time: formatRelativeTime(msg.createdAt),
  }));

  return result;
};
