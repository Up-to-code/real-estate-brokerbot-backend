import { ResponseParser, ProcessedResult, OpenAIResponse } from '../types/aiTypes';
import { arabicTypeToEnum } from '../utils/arabicTypeToEnum';

function parseJsonResponse(response: string): OpenAIResponse {
  try {
    return JSON.parse(response) as OpenAIResponse;
  } catch {
    // Try to extract JSON from response if it's wrapped in other text
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as OpenAIResponse;
    }
    throw new Error('No valid JSON found in response');
  }
}

function mapToProcessedResult(parsed: OpenAIResponse): ProcessedResult {
  switch (parsed.type) {
    case 'answer':
      return {
        type: 'answer',
        text: parsed.content
      };

    case 'search':
      if (!parsed.query) {
        throw new Error('Search response missing query field');
      }
      // Map Arabic type to enum if present
      if (typeof parsed.query === 'object' && parsed.query !== null && 'type' in parsed.query && typeof (parsed.query as Record<string, any>).type === 'string') {
        const queryObj = parsed.query as Record<string, any>;
        const arType = queryObj.type.trim();
        if (arabicTypeToEnum[arType]) {
          queryObj.type = arabicTypeToEnum[arType];
        }
      }
      return {
        type: 'search',
        query: parsed.query
      };

    case 'event':
      if (!parsed.eventName || !parsed.eventDetails) {
        throw new Error('Event response missing required fields');
      }
      return {
        type: 'event',
        name: parsed.eventName,
        details: parsed.eventDetails
      };

    default:
      throw new Error(`Unknown response type: ${parsed.type}`);
  }
}

export function createResponseParser(): ResponseParser {
  return {
    parseResponse(response: string): ProcessedResult {
      try {
        const parsed = parseJsonResponse(response);
        return mapToProcessedResult(parsed);
      } catch (error) {
        // Fallback: treat as general answer if parsing fails
        return {
          type: 'answer',
          text: 'I apologize, but I encountered an issue processing your request. Please try rephrasing your question.'
        };
      }
    }
  };
} 