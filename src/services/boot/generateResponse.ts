import { prisma } from "../../lib/prisma";
import { processRealEstateMessage } from "./ai/generateResponseUsingLLM";
import findRelevantQAPairs from "./findRelevantQAPairs";
import { searchProperties } from "./services/searchProperties";
import type { SearchResult } from "./services/searchProperties";
  
async function generateResponse(message: string, phoneNumber?: string, name?: string): Promise<string | SearchResult> {
  // Find relevant QA pairs with similarity scores
  const { results: relevantQAs } = await findRelevantQAPairs(message);

  if (relevantQAs.length > 0) {
    console.log("relevantQAs", relevantQAs);
  }

  // Fetch recent search and message history for context
  let historySummary = "";
  let clientId: string | undefined = undefined;
  if (phoneNumber) {
    const client = await prisma.client.findUnique({ where: { phoneNumber } });
    if (client) {
      clientId = client.id;
      // Fetch recent user messages
      const recentMessages = await prisma.userMessageHistory.findMany({
        where: { clientId: client.id },
        orderBy: { createdAt: "desc" },
        take: 3
      });
      // Fetch recent searches
      const recentSearches = await prisma.searchHistory.findMany({
        where: { clientId: client.id },
        orderBy: { createdAt: "desc" },
        take: 3
      });
      const messagesSummary = recentMessages
        .map((m, i) => `رسالة ${i + 1}: ${m.message} (نوع الرد: ${m.responseType})`)
        .join("\n");
      const searchesSummary = recentSearches
        .map((h, i) => `بحث ${i + 1}: ${JSON.stringify(h.query)}`)
        .join("\n");
      historySummary = [messagesSummary, searchesSummary].filter(Boolean).join("\n");
    }
  }

  // Generate response using LLM, now with user info and history
  const response = await processRealEstateMessage(message, undefined, phoneNumber, name, historySummary);

  // Save every user message and LLM response type
  if (clientId) {
    await prisma.userMessageHistory.create({
      data: {
        clientId,
        message,
        responseType: response.type,
        llmResponse: JSON.stringify(response)
      }
    });
  }

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
          query: response.query
        }
      });
    }
    return properties;
  }

  if (response.type === "event") {
    console.log("response", response.details);
    return response.details;
  }

  return "No response found";
}

export default generateResponse;
