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
import { handleTextMessage } from "./handleTextMessage";

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

    const result = webhookHandlerDataExtraction(webhook);

    if (result.messageType === "text") {
      await handleTextMessage(result);
    }

    res.status(200).json({ message: "Message received" });
  } catch (error) {
    console.error("Error in Handle_Message_webhook:", error);
    next(error);
  }
};

export default Handle_Message_webhook;
