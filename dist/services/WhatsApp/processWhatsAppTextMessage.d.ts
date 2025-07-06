import { WebhookHandlerDataExtractionResult } from "../webhook/webhookHandlerDataExtraction";
declare function processWhatsAppTextMessage(whatsappClient: WebhookHandlerDataExtractionResult): Promise<string>;
export default processWhatsAppTextMessage;
