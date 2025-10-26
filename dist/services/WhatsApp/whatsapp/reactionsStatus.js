"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendReaction = sendReaction;
exports.removeReaction = removeReaction;
exports.markAsRead = markAsRead;
const httpClient_1 = require("./httpClient");
async function sendReaction(config, to, messageId, emoji) {
    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'reaction',
        reaction: {
            message_id: messageId,
            emoji
        }
    };
    return (0, httpClient_1.makeApiRequest)(config, 'messages', payload);
}
async function removeReaction(config, to, messageId) {
    return sendReaction(config, to, messageId, '');
}
async function markAsRead(config, messageId) {
    const payload = {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
    };
    await (0, httpClient_1.makeApiRequest)(config, 'messages', payload);
    return { success: true };
}
