"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWebhookVerificationError = void 0;
const createWebhookVerificationError = (message) => {
    const error = new Error(message);
    error.name = "WebhookVerificationError";
    return error;
};
exports.createWebhookVerificationError = createWebhookVerificationError;
