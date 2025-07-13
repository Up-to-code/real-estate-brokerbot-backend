 
import generateResponse from "../boot/generateResponse";
import findClientByPhoneNumberOrCreate from "../Client/findClientByPhoneNumberOrCreate";
import saveMessageToDb from "../Client/saveMessageToDb";
import { WebhookHandlerDataExtractionResult } from "../webhook/webhookHandlerDataExtraction";

async function processWhatsAppTextMessage(
  whatsappClient: WebhookHandlerDataExtractionResult
) {
  // 1. find or create client
  const client = await findClientByPhoneNumberOrCreate(whatsappClient);
  // 2. save message to db
  const message = await saveMessageToDb(whatsappClient, client);
  // 3 generateResponse, now pass user info
  const response = await generateResponse(
    whatsappClient.message,
    client.phoneNumber,
    client.name
  );
  // process message
  return response;
}

export default processWhatsAppTextMessage;
