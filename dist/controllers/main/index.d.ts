declare function getDashboardStatistics(): Promise<{
    totalClients: number;
    totalMessages: number;
    activeCampaigns: number;
    activeClients: number;
    RecentMessages: any;
    DailyMessages: Promise<any>;
}>;
export default getDashboardStatistics;
