export declare const getAllClients: () => Promise<({
    messages: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        clientId: string;
        isBot: boolean;
        whatsappMessageId: string | null;
        status: import(".prisma/client").$Enums.MessageStatus | null;
        sentAt: Date | null;
    }[];
    campaigns: {
        id: string;
        clientId: string;
        campaignId: string;
    }[];
} & {
    name: string;
    id: string;
    phoneNumber: string;
    email: string | null;
    lastActive: Date;
    lastMessage: string;
    createdAt: Date;
    updatedAt: Date;
    type: string;
    plan: import(".prisma/client").$Enums.Plan;
    dailyMessageCount: number;
    lastMessageResetDate: Date;
})[] | {
    success: boolean;
    error: string;
}>;
export declare const getClientById: (id: string) => Promise<({
    messages: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        text: string;
        clientId: string;
        isBot: boolean;
        whatsappMessageId: string | null;
        status: import(".prisma/client").$Enums.MessageStatus | null;
        sentAt: Date | null;
    }[];
    campaigns: {
        id: string;
        clientId: string;
        campaignId: string;
    }[];
} & {
    name: string;
    id: string;
    phoneNumber: string;
    email: string | null;
    lastActive: Date;
    lastMessage: string;
    createdAt: Date;
    updatedAt: Date;
    type: string;
    plan: import(".prisma/client").$Enums.Plan;
    dailyMessageCount: number;
    lastMessageResetDate: Date;
}) | {
    success: boolean;
    error: string;
} | null>;
export declare const createClient: (client: any) => Promise<{
    name: string;
    id: string;
    phoneNumber: string;
    email: string | null;
    lastActive: Date;
    lastMessage: string;
    createdAt: Date;
    updatedAt: Date;
    type: string;
    plan: import(".prisma/client").$Enums.Plan;
    dailyMessageCount: number;
    lastMessageResetDate: Date;
} | {
    success: boolean;
    error: string;
}>;
export declare const updateClient: (id: string, client: any) => Promise<{
    name: string;
    id: string;
    phoneNumber: string;
    email: string | null;
    lastActive: Date;
    lastMessage: string;
    createdAt: Date;
    updatedAt: Date;
    type: string;
    plan: import(".prisma/client").$Enums.Plan;
    dailyMessageCount: number;
    lastMessageResetDate: Date;
} | {
    success: boolean;
    error: string;
}>;
export declare const deleteClient: (id: string) => Promise<{
    name: string;
    id: string;
    phoneNumber: string;
    email: string | null;
    lastActive: Date;
    lastMessage: string;
    createdAt: Date;
    updatedAt: Date;
    type: string;
    plan: import(".prisma/client").$Enums.Plan;
    dailyMessageCount: number;
    lastMessageResetDate: Date;
} | {
    success: boolean;
    error: string;
}>;
