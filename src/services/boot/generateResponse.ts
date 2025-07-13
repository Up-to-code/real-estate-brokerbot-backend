import { logIncomingMessage, logLLMResponse } from "./ai/utils/logMessage";
import {
  buildHistorySummary,
  getPropertyNameFromHistory,
} from "./ai/utils/historyUtils";
import { processRealEstateMessage } from "./ai";
import { handleSearch } from "./ai/utils/propertySearch";
import { handleGeneratePropertyPdfEvent } from "./ai/utils/eventHandlers";
import { getSimilarityScore } from "./ai/utils/similarityUtils";
import { prisma } from "../../lib/prisma";

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
    historySummary
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
      return `
        ${response.details.propertyId}
      
       
      `
    }
    return "حدث غير معروف";
  }

  return "No response found";
}

export default generateResponse;
