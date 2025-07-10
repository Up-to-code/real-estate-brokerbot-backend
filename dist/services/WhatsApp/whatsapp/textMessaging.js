"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendText = sendText;
exports.sendTextWithTypingEffect = sendTextWithTypingEffect;
const httpClient_1 = require("./httpClient");
async function sendText(config, to, message, options = {}) {
    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: {
            preview_url: options.previewUrl || false,
            body: message
        }
    };
    if (options.replyToMessageId) {
        payload.context = { message_id: options.replyToMessageId };
    }
    return (0, httpClient_1.makeApiRequest)(config, 'messages', payload);
}
async function sendTextWithTypingEffect(config, to, message, options = {}) {
    const typingSpeed = options.typingSpeed || 40;
    const responses = [];
    const sentences = message
        .split(/[.!?]+/)
        .filter(s => s.trim())
        .map(s => s.trim() + '.');
    for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i];
        const words = sentence.split(' ').length;
        const delay = (words / typingSpeed) * 60000;
        await new Promise(resolve => setTimeout(resolve, delay));
        const response = await sendText(config, to, sentence, {
            replyToMessageId: i === 0 ? options.replyToMessageId : undefined,
            previewUrl: options.previewUrl
        });
        console.log("response from sendText ", response);
        responses.push(response);
        if (i < sentences.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    }
    return responses;
}
