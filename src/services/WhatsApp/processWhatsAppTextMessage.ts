 
import generateResponse from "../boot/generateResponse";
import findClientByPhoneNumberOrCreate from "../Client/findClientByPhoneNumberOrCreate";
import saveMessageToDb from "../Client/saveMessageToDb";
import { WebhookHandlerDataExtractionResult } from "../webhook/webhookHandlerDataExtraction";
import generatePropertyPdf from "../boot/pdf/generatePRopertyPdf";
import { buildHistorySummary } from "../boot/ai/utils/historyUtils";

// Helper: detect if message is a PDF request (flexible, supports typos and synonyms)
function isPdfRequest(message: string): boolean {
  if (!message) return false;
  const lowered = message.toLowerCase();
  const pdfWords = [
    "pdf", "بي دي اف", "ملف", "سوي لي pdf", "ابي pdf", "أريد pdf", "ملف للعقار", "ملف عقار", "ملف بي دي اف", "send pdf", "create pdf"
  ];
  return pdfWords.some(word => lowered.includes(word));
}

async function processWhatsAppTextMessage(
  whatsappClient: WebhookHandlerDataExtractionResult
) {
  // 1. find or create client
  const client = await findClientByPhoneNumberOrCreate(whatsappClient);
  // 2. save message to db
  await saveMessageToDb(whatsappClient, client);

  // 3. Run LLM
  const response = await generateResponse(
    whatsappClient.message,
    client.phoneNumber,
    client.name
  );

  // 4. If LLM says to generate PDF and provides propertyId, do it
  if (
    response &&
    response.type === "event" &&
    (response.name === "generate_property_pdf" || response.eventName === "generate_property_pdf") &&
    response.details &&
    response.details.propertyId &&
    response.details.phone
  ) {
    return await generatePropertyPdf({
      type: "event",
      name: response.details.name || client.name || "عميل",
      details: {
        propertyId: response.details.propertyId,
        phone: response.details.phone,
        name: response.details.name || client.name || "عميل"
      }
    });
  }

  // 5. If user explicitly asked for PDF but LLM didn't extract propertyId, fallback to history
  if (isPdfRequest(whatsappClient.message)) {
    const { summary: historySummary } = await buildHistorySummary(client.phoneNumber);
    const lastPropertyIdMatch = historySummary.match(/propertyId: ([a-zA-Z0-9\-]+)/);
    const lastPropertyId = lastPropertyIdMatch ? lastPropertyIdMatch[1] : undefined;
    if (lastPropertyId) {
      return await generatePropertyPdf({
        type: "event",
        name: client.name || "عميل",
        details: {
          propertyId: lastPropertyId,
          phone: client.phoneNumber,
          name: client.name || "عميل"
        }
      });
    } else {
      return { success: false, message: "لم يتم العثور على آخر عقار بحثت عنه. يرجى البحث عن عقار أولاً." };
    }
  }

  // 6. Otherwise, just return the LLM response
  return response;
}

export default processWhatsAppTextMessage;
