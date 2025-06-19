import { Client, MessageStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { WebhookHandlerDataExtractionResult } from "../webhook/webhookHandlerDataExtraction";

async function saveMessageToDb(
  whatsappClient: WebhookHandlerDataExtractionResult,
  client: Client
) {
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

  const message = await prisma.message.create({
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

export default saveMessageToDb;