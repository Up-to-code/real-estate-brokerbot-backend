import { prisma } from "../../lib/prisma";
import { WebhookHandlerDataExtractionResult } from "../webhook/webhookHandlerDataExtraction";
import { MessageStatus } from "@prisma/client";

async function findClientByPhoneNumberOrCreate(
  whatsappClient: WebhookHandlerDataExtractionResult
) {
  const client = await prisma.client.findUnique({
    where: { phoneNumber: whatsappClient.sender },
  });
  
  if (!client) {
    // Ensure we have a valid timestamp
    let messageTimestamp: Date;
    try {
      // First try to parse the timestamp
      if (whatsappClient.timestamp && whatsappClient.timestamp !== "No timestamp") {
        const parsed = new Date(whatsappClient.timestamp);
        messageTimestamp = isNaN(parsed.getTime()) ? new Date() : parsed;
      } else {
        messageTimestamp = new Date();
      }
    } catch (error) {
      // If anything goes wrong, use current date
      messageTimestamp = new Date();
    }

    // Ensure we have a valid message status
    let messageStatus: MessageStatus = MessageStatus.RECEIVED;
    if (Object.values(MessageStatus).includes(whatsappClient.messageStatus as MessageStatus)) {
      messageStatus = whatsappClient.messageStatus as MessageStatus;
    }

    const newClient = await prisma.client.create({
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

export default findClientByPhoneNumberOrCreate;