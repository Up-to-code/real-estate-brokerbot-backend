interface WebhookVerificationError extends Error {
    name: "WebhookVerificationError";
    message: string;
}
export declare const createWebhookVerificationError: (message: string) => WebhookVerificationError;
export {};
