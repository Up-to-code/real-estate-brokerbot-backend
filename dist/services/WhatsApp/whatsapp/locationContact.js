"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLocation = sendLocation;
exports.sendContact = sendContact;
const httpClient_1 = require("./httpClient");
async function sendLocation(config, to, latitude, longitude, name, address, options = {}) {
    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'location',
        location: { latitude, longitude }
    };
    if (name)
        payload.location.name = name;
    if (address)
        payload.location.address = address;
    if (options.replyToMessageId)
        payload.context = { message_id: options.replyToMessageId };
    return (0, httpClient_1.makeApiRequest)(config, 'messages', payload);
}
async function sendContact(config, to, name, phone, email, options = {}) {
    const contact = {
        name: { formatted_name: name },
        phones: [{ phone, type: 'MOBILE' }]
    };
    if (email) {
        contact.emails = [{ email, type: 'HOME' }];
    }
    const payload = {
        messaging_product: 'whatsapp',
        to,
        type: 'contacts',
        contacts: [contact]
    };
    if (options.replyToMessageId) {
        payload.context = { message_id: options.replyToMessageId };
    }
    return (0, httpClient_1.makeApiRequest)(config, 'messages', payload);
}
