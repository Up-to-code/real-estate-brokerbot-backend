"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendButtons = sendButtons;
exports.sendList = sendList;
const httpClient_1 = require("./httpClient");
async function sendButtons(config, to, bodyText, buttons, options = {}) {
    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
            type: 'button',
            body: { text: bodyText },
            action: {
                buttons: buttons.map(btn => ({
                    type: 'reply',
                    reply: { id: btn.id, title: btn.title }
                }))
            }
        }
    };
    if (options.headerText) {
        payload.interactive.header = { type: 'text', text: options.headerText };
    }
    if (options.footerText) {
        payload.interactive.footer = { text: options.footerText };
    }
    if (options.replyToMessageId) {
        payload.context = { message_id: options.replyToMessageId };
    }
    return (0, httpClient_1.makeApiRequest)(config, 'messages', payload);
}
async function sendList(config, to, bodyText, buttonText, sections, options = {}) {
    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
            type: 'list',
            body: { text: bodyText },
            action: {
                button: buttonText,
                sections
            }
        }
    };
    if (options.headerText) {
        payload.interactive.header = { type: 'text', text: options.headerText };
    }
    if (options.footerText) {
        payload.interactive.footer = { text: options.footerText };
    }
    if (options.replyToMessageId) {
        payload.context = { message_id: options.replyToMessageId };
    }
    return (0, httpClient_1.makeApiRequest)(config, 'messages', payload);
}
