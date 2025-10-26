import OpenAI from 'openai';
import { OpenAIService } from '../types/aiTypes';
import { createSystemPrompt, createUserPrompt } from './OpenAIServiceImpl.helpers';

export function createOpenAIService(apiKey: string): OpenAIService {
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000", // Optional. Site URL for rankings on openrouter.ai.
      "X-Title": process.env.SITE_NAME || "My AI App", // Optional. Site title for rankings on openrouter.ai.
    },
  });

  return {
    async sendPrompt(message: string, phoneNumber?: string, name?: string, historySummary?: string): Promise<string> {
      try {
        const systemPrompt = createSystemPrompt(phoneNumber, name, historySummary);
        const userPrompt = createUserPrompt(message);

        const completion = await openai.chat.completions.create({
          model: 'minimax/minimax-m2:free', // Using OpenRouter's free model
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
          throw new Error('No response received from OpenRouter');
        }

        return response;
      } catch (error) {
        throw new Error(`OpenRouter API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };
}