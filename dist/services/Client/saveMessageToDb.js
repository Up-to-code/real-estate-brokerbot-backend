"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma_1 = require("../../lib/prisma");
async function saveMessageToDb(whatsappClient, client) {
    let messageTimestamp;
    try {
        if (whatsappClient.timestamp && whatsappClient.timestamp !== "No timestamp") {
            const parsed = new Date(whatsappClient.timestamp);
            messageTimestamp = isNaN(parsed.getTime()) ? new Date() : parsed;
        }
        else {
            messageTimestamp = new Date();
        }
    }
    catch (error) {
        messageTimestamp = new Date();
    }
    let messageStatus = client_1.MessageStatus.RECEIVED;
    if (Object.values(client_1.MessageStatus).includes(whatsappClient.messageStatus)) {
        messageStatus = whatsappClient.messageStatus;
    }
    const existing = await prisma_1.prisma.message.findUnique({
        where: { whatsappMessageId: whatsappClient.messageId }
    });
    if (existing) {
        return existing;
    }
    const message = await prisma_1.prisma.message.create({
        data: {
            text: whatsappClient.message,
            clientId: client.id,
            isBot: false,
            whatsappMessageId: whatsappClient.messageId,
            status: messageStatus,
            sentAt: messageTimestamp,
        },
    });
    return message;
}
exports.default = saveMessageToDb;
