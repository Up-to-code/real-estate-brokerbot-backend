import { logIncomingMessage, logLLMResponse } from "./ai/utils/logMessage";
import {
  buildHistorySummary,
  getPropertyNameFromHistory,
} from "./ai/utils/historyUtils";
import { processRealEstateMessage } from "./ai";
import { handleSearch } from "./ai/utils/propertySearch";

import { prisma } from "../../lib/prisma";
import generatePropertyPdf from "./pdf/generatePRopertyPdf";

async function generateResponse(
  message: string,
  phoneNumber?: string,
  name?: string
): Promise<string | any> {
  logIncomingMessage(message);

  const { summary: historySummary, clientId } = await buildHistorySummary(
    phoneNumber
  );
  console.log("historySummary", historySummary);
  const response = await processRealEstateMessage(
    message,
    undefined,
    phoneNumber,
    name,
    // historySummary
  );

  logLLMResponse(response);

  if (clientId) {
    await prisma.userMessageHistory.create({
      data: {
        clientId,
        message,
        responseType: response.type,
        llmResponse: JSON.stringify(response),
      },
    });
  }

  if (response.type === "answer") return response.text;

  if (response.type === "search") {
    return await handleSearch(response.query, clientId);
  }

  if (response.type === "event") {
    if (response.name === "generate_property_pdf") {
      console.log("handleGeneratePropertyPdfEvent", response);
      if (response.details.name && response.details.propertyId) {
        const pdf = await generatePropertyPdf({
          type: "event",
          name: response.details.name,
          details: response.details
        });
        return pdf;
      }

    }

    // if (response.name === "remember_time") {
    //   if (response.details.time) {
    
  }
  if (response.type === "reminder") {
    console.log("handleReminderEvent", response);
  }

  return "No response found";
}

export default generateResponse;
