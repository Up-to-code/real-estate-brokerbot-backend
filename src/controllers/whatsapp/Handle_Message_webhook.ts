import { Request, Response, NextFunction } from "express";
import { WhatsAppWebhook } from "./type";

import webhookHandlerDataExtraction from "../../services/webhook/webhookHandlerDataExtraction";
import processWhatsAppTextMessage from "../../services/WhatsApp/processWhatsAppTextMessage";
import {
  DEFAULT_CONFIG,
  markAsRead,
  sendText,
  sendImage,
  sendImagesGroup,
} from "../../services/WhatsApp/whatsapp";
import { sendPropertyResult } from "./sendPropertyResult";
import { handleTextMessage } from "./handleTextMessage";
import { z } from "zod";

// Zod schema for WhatsApp webhook validation
const WhatsAppWebhookSchema = z.object({
  object: z.string(),
  entry: z.array(z.any()), // You can make this stricter if needed
});

/**
 * POST endpoint for receiving webhook notifications from WhatsApp Business API
 *
 * This endpoint handles incoming webhook events from WhatsApp, including:
 * - Text messages from users
 * - Media messages (images, audio, etc.)
 * - Status updates for sent messages
 *
 * The endpoint processes messages and always returns a 200 OK response to acknowledge receipt.
 *
 * @route POST /api/v1/webhook/whatsapp
 * @param {Request} req - Express request object containing the webhook payload
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Response} JSON response indicating success or error
 */
// In-memory set for processed message IDs (use Redis/DB for production)
const processedMessageIds = new Set<string>();

const Handle_Message_webhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate payload
    const parseResult = WhatsAppWebhookSchema.safeParse(req.body);
    if (!parseResult.success) {
      console.error("Invalid webhook payload", parseResult.error);
      res.status(400).json({ error: "Invalid payload" });
      return;
    }

    const webhook = req.body as WhatsAppWebhook;
    const result = webhookHandlerDataExtraction(webhook);

    // Duplicate message prevention
    if (result.messageId && processedMessageIds.has(result.messageId)) {
      console.log("Duplicate message detected, skipping:", result.messageId);
      res.status(200).json({ message: "Duplicate message ignored" });
      return;
    }
    if (result.messageId) {
      processedMessageIds.add(result.messageId);
      // Optionally: clean up old IDs after a while to avoid memory leak
      setTimeout(() => processedMessageIds.delete(result.messageId), 60 * 60 * 1000); // 1 hour
    }

    switch (result.messageType) {
      case "text":
        await handleTextMessage(result);
        break;
      // Add more cases for other types (image, video, etc.)
      default:
        console.log("Unhandled message type:", result.messageType);
    }

    res.status(200).json({ message: "Message received" });
  } catch (error) {
    console.error("Error in Handle_Message_webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default Handle_Message_webhook;
