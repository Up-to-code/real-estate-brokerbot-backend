export declare const getRecentMessages: () => Promise<{
    user: string;
    action: string;
    message: string;
    time: string;
}[]>;
