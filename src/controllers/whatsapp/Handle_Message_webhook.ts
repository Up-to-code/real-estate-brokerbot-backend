import { Request, Response, NextFunction } from "express";
import { WhatsAppWebhook } from "./type";

import webhookHandlerDataExtraction from "../../services/webhook/webhookHandlerDataExtraction";
import processWhatsAppTextMessage from "../../services/WhatsApp/processWhatsAppTextMessage";
import {
  DEFAULT_CONFIG,
  sendTextWithTypingEffect,
  markAsRead,
  sendText,
  sendImage,
  sendImagesGroup,
} from "../../services/WhatsApp/whatsapp";
import { sendPropertyResult } from "./sendPropertyResult";

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
const Handle_Message_webhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const webhook = req.body as WhatsAppWebhook;

    console.log("🔥 Incoming webhook received");

    const result = webhookHandlerDataExtraction(webhook);
    console.log("🧪 result.messageType:", result.name);

    if (result.messageType === "text") {
      console.log("💬 Processing text message");
      // Mark the incoming message as read
      if (result.messageId) {
        await markAsRead(DEFAULT_CONFIG, result.messageId);
      }
      const response = await processWhatsAppTextMessage(result);
      console.log("🎯 Response from processor:", response);
      if (typeof response === "string") {
        // sendTextWithTypingEffect returns an array, but you likely want to send the full response as one message
        await sendText(DEFAULT_CONFIG, result.sender, response);
      }
      if (typeof response === "object" && response && Array.isArray(response.properties)) {
        await sendPropertyResult(response as any, result.sender);
      }
    }

    res.status(200).json({ message: "Message received" });
  } catch (error) {
    console.error("Error in Handle_Message_webhook:", error);
    next(error);
  }
};

export default Handle_Message_webhook;
