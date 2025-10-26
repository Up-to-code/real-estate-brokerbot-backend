"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppMessage = sendWhatsAppMessage;
const node_fetch_1 = __importDefault(require("node-fetch"));
const config_1 = require("./config");
async function sendWhatsAppMessage(phoneNumber, mediaId, property) {
    console.log('💬 Sending WhatsApp message...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config_1.TIMEOUT_MS);
    try {
        const response = await (0, node_fetch_1.default)(`https://graph.facebook.com/v18.0/${config_1.PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${config_1.WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: phoneNumber,
                type: 'document',
                document: {
                    id: mediaId,
                    filename: `${property.title || 'property'}.pdf`,
                    caption: `تفاصيل العقار: ${property.title || 'عقار مميز'}\n${property.marketer.name} - ${property.marketer.role}`
                }
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        const result = await response.json();
        if (!response.ok || result.error) {
            const errorMsg = result.error?.message || `Request failed: ${response.status}`;
            throw new Error(errorMsg);
        }
        const messageId = result.messages?.[0]?.id;
        if (!messageId) {
            throw new Error('No message ID returned from WhatsApp');
        }
        console.log('✅ Message sent successfully, ID:', messageId);
        return messageId;
    }
    catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Message sending timed out');
        }
        throw error;
    }
}
