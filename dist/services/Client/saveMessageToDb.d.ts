import { Client } from "@prisma/client";
import { WebhookHandlerDataExtractionResult } from "../webhook/webhookHandlerDataExtraction";
declare function saveMessageToDb(whatsappClient: WebhookHandlerDataExtractionResult, client: Client): Promise<any>;
export default saveMessageToDb;
