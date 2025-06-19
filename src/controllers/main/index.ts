import { prisma } from "../../lib/prisma";
import safeQuery from "../../lib/prisma/safeQuery";
import { getDailyMessagesThisMonth } from "../../services/dashboard/DailyMessages";
import { getRecentMessages } from "../../services/dashboard/getRecentMessages";

async function getDashboardStatistics() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalClients, totalMessages, activeCampaigns, activeClients] =
      await Promise.all([
        safeQuery(prisma.client.count(), 0),
        safeQuery(prisma.message.count(), 0),
        safeQuery(prisma.campaign.count({ where: { status: "Active" } }), 0),

        safeQuery(
          prisma.client.count({
            where: { lastActive: { gte: thirtyDaysAgo } },
          }),
          0
        ),
      ]);

    const RecentMessages = await getRecentMessages();
    const DailyMessages = getDailyMessagesThisMonth();

    return {
      totalClients,
      totalMessages,
      activeCampaigns,
      activeClients,
      RecentMessages,
      DailyMessages,
    };
  } catch (error) {
    throw new Error("Failed to fetch dashboard statistics");
  }
}

export default getDashboardStatistics;
