import {
  DEFAULT_CONFIG,
  markAsRead,
  sendText,
} from "../../services/WhatsApp/whatsapp";
import processWhatsAppTextMessage from "../../services/WhatsApp/processWhatsAppTextMessage";
import { sendPropertyResult } from "./sendPropertyResult";
import { WebhookHandlerDataExtractionResult } from "../../services/webhook/webhookHandlerDataExtraction";

export async function handleTextMessage(
  result: WebhookHandlerDataExtractionResult
) {
  console.log("💬 Processing text message");
  // Mark the incoming message as read
  if (result.messageId) {
    await markAsRead(DEFAULT_CONFIG, result.messageId);
  }
  // Process the message
  const response = await processWhatsAppTextMessage(result);
  console.log("🎯 Response from processor:", response);
  if (typeof response === "string") {
    // sendTextWithTypingEffect returns an array, but you likely want to send the full response as one message
    await sendText(DEFAULT_CONFIG, result.sender, response);
  }
  if (
    typeof response === "object" &&
    response &&
    Array.isArray(response.properties)
  ) {
    await sendPropertyResult(response as any, result.sender);
  }
}
