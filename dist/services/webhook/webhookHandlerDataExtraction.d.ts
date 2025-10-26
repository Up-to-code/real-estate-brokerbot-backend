import { WhatsAppWebhook } from "../../controllers/whatsapp/type";
export interface WebhookHandlerDataExtractionResult {
    status: string;
    message: string;
    sender: string;
    receiver: string;
    timestamp: string;
    messageId: string;
    messageType: string;
    messageStatus: string;
    name: string;
}
declare function webhookHandlerDataExtraction(webhook: WhatsAppWebhook): WebhookHandlerDataExtractionResult;
export default webhookHandlerDataExtraction;
