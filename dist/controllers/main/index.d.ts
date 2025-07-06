declare function getDashboardStatistics(): Promise<{
    totalClients: number;
    totalMessages: number;
    activeCampaigns: number;
    activeClients: number;
    RecentMessages: {
        user: string;
        action: string;
        message: string;
        time: string;
    }[];
    DailyMessages: Promise<{
        id: string;
        createdAt: Date;
        date: Date;
        count: number;
    }[]>;
}>;
export default getDashboardStatistics;
