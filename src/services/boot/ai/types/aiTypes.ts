// Types and interfaces for AI module

export type ProcessedResult = 
  | { type: 'answer'; text: string }
  | { type: 'search'; query: string }
  | { type: 'event'; name: string; details: string };

export interface OpenAIResponse {
  type: 'answer' | 'search' | 'event';
  content: string;
  query?: string;
  eventName?: string;
  eventDetails?: string;
}

export interface OpenAIService {
  sendPrompt(message: string, phoneNumber?: string, name?: string, historySummary?: string): Promise<string>;
}

export interface ResponseParser {
  parseResponse(response: string): ProcessedResult;
} 