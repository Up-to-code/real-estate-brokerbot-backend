"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../lib/prisma");
const client_1 = require("@prisma/client");
async function findClientByPhoneNumberOrCreate(whatsappClient) {
    const client = await prisma_1.prisma.client.findUnique({
        where: { phoneNumber: whatsappClient.sender },
    });
    if (!client) {
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
        const newClient = await prisma_1.prisma.client.create({
            data: {
                phoneNumber: whatsappClient.sender,
                name: whatsappClient.name,
                lastMessage: whatsappClient.message,
                lastActive: new Date(),
                type: "WhatsApp",
                messages: {
                    create: {
                        text: whatsappClient.message,
                        whatsappMessageId: whatsappClient.messageId,
                        status: messageStatus,
                        sentAt: messageTimestamp,
                    },
                },
            },
        });
        return newClient;
    }
    return client;
}
exports.default = findClientByPhoneNumberOrCreate;
