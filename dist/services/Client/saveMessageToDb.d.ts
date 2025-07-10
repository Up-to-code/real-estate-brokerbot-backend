import { Client } from "@prisma/client";
import { WebhookHandlerDataExtractionResult } from "../webhook/webhookHandlerDataExtraction";
declare function saveMessageToDb(whatsappClient: WebhookHandlerDataExtractionResult, client: Client): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    text: string;
    clientId: string;
    isBot: boolean;
    whatsappMessageId: string | null;
    status: import(".prisma/client").$Enums.MessageStatus | null;
    sentAt: Date | null;
}>;
export default saveMessageToDb;
