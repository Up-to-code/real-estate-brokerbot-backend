import { WebhookHandlerDataExtractionResult } from "../webhook/webhookHandlerDataExtraction";
declare function findClientByPhoneNumberOrCreate(whatsappClient: WebhookHandlerDataExtractionResult): Promise<{
    name: string;
    id: string;
    phoneNumber: string;
    email: string | null;
    lastActive: Date;
    lastMessage: string;
    createdAt: Date;
    updatedAt: Date;
    type: string;
}>;
export default findClientByPhoneNumberOrCreate;
