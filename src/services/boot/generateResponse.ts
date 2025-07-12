import { prisma } from "../../lib/prisma";
import { processRealEstateMessage } from "./ai";
import findRelevantQAPairs from "./findRelevantQAPairs";
import { searchProperties } from "./services/searchProperties";
import type { SearchResult } from "./services/searchProperties";
import { buildHistorySummary, getPropertyNameFromHistory } from "./ai/utils/historyUtils";
import { getSimilarityScore } from "./ai/utils/similarityUtils";
import { isStructuredEventResponse } from "./ai/types/typeGuards";
import { handleGeneratePropertyPdfEvent } from "./ai/utils/eventHandlers";

/**
 * generateResponse
 * Generate a response for a user message, possibly searching properties or handling events.
 * Returns a string (answer/event) or SearchResult (search).
 */
async function generateResponse(
  message: string,
  phoneNumber?: string,
  name?: string
): Promise<string | SearchResult> {
  // DEBUG: Log incoming message
  console.log('[DEBUG] Incoming message:', message);

  // 1. Find relevant QA pairs (optional logging)
  const { results: relevantQAs } = await findRelevantQAPairs(message);
  if (relevantQAs.length > 0) {
    console.log("relevantQAs", relevantQAs);
  }

  // 2. Build user history summary and get clientId
  const { summary: historySummary, clientId } = await buildHistorySummary(phoneNumber);

  // 3. Generate response using LLM
  const response = await processRealEstateMessage(
    message,
    undefined, // API key (use default)
    phoneNumber,
    name,
    historySummary
  );

  // DEBUG: Log LLM response
  console.log('[DEBUG] LLM response:', response);

  // 4. Save user message and LLM response type
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

  // 5. Handle response types with early returns
  if (response.type === "answer") {
    console.log("response", response.text);
    return response.text;
  }

  if (response.type === "search") {
    console.log("response query", response.query);
    const properties = await searchProperties(response.query);
    console.log("properties", properties);
    // Save this search to history
    if (clientId) {
      await prisma.searchHistory.create({
        data: {
          clientId,
          query: response.query,
        },
      });
    }
    return properties;
  }

  // Handle structured event
  if (isStructuredEventResponse(response)) {
    switch (response.eventName) {
      case "generate_property_pdf":
        return await handleGeneratePropertyPdfEvent({
          eventDetails: response.eventDetails,
          historySummary,
          name,
          prisma,
          getPropertyNameFromHistory,
          getSimilarityScore
        });
      default:
        // fallback for unknown events
        return response.content || "حدث غير معروف";
    }
  }

  if (response.type === "event") {
    // Log the user's original message with a logo
    console.log("📨 User message:", message);
    console.log("response", response.details);
    return response.details;
  }

  // 6. Fallback if no response type matched
  console.log('[DEBUG] No matching event handler for response:', response);
  return "No response found";
}

export default generateResponse;
