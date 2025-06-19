import { processRealEstateMessage } from "./ai/generateResponseUsingLLM";
import findRelevantQAPairs from "./findRelevantQAPairs";
import { searchProperties } from "./services/searchProperties";

async function generateResponse(message: string) {
  // Find relevant QA pairs with similarity scores
  const { results: relevantQAs } = await findRelevantQAPairs(message);

  if (relevantQAs.length > 0) {
    console.log("relevantQAs", relevantQAs);
  }

  // Generate response using LLM
  const response = await processRealEstateMessage(message);

  if (response.type === "answer") {
    console.log("response", response.text);
    return response.text;
  }

  if (response.type === "search") {
    console.log("response", response.query);
    const properties = await searchProperties(response.query);
    console.log("properties", properties);
    return response.query;
  }

  if (response.type === "event") {
    console.log("response", response.details);
    return response.details;
  }

  return "No response found";
}

export default generateResponse;
