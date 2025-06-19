import { Request, Response, NextFunction } from "express";
import { WhatsAppWebhook } from "./type";
import webhookHandlerDataExtraction from "../../services/webhook/webhookHandlerDataExtraction";
import processWhatsAppTextMessage from "../../services/WhatsApp/processWhatsAppTextMessage";
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
 * @returns {Response} JSON response indicating success or error
 *
 * @example
 * // Example webhook payload
 * {
 *   "object": "whatsapp_business_account",
 *   "entry": [{
 *     "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
 *     "changes": [{
 *       "value": {
 *         "messaging_product": "whatsapp",
 *         "metadata": {
 *           "display_phone_number": "PHONE_NUMBER",
 *           "phone_number_id": "PHONE_NUMBER_ID"
 *         },
 *         "contacts": [{
 *           "profile": { "name": "CONTACT_NAME" },
 *           "wa_id": "WHATSAPP_ID"
 *         }],
 *         "messages": [{
 *           "from": "SENDER_WHATSAPP_ID",
 *           "id": "MESSAGE_ID",
 *           "timestamp": "TIMESTAMP",
 *           "type": "text",
 *           "text": { "body": "MESSAGE_BODY" }
 *         }]
 *       },
 *       "field": "messages"
 *     }]
 *   }]
 * }
 */
const Handle_Message_webhook = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const webhook = req.body as WhatsAppWebhook;

    const result = webhookHandlerDataExtraction(webhook);
    if (result.messageType === "text") {
      processWhatsAppTextMessage(result);
    }

    res.status(200).json({ message: "Message received" });
  } catch (error) {
    next(error);
  }
};

export default Handle_Message_webhook;
