import OpenAI from 'openai';
import { OpenAIService } from '../types/aiTypes';
import { createSystemPrompt, createUserPrompt } from './OpenAIServiceImpl.helpers';

export function createOpenAIService(apiKey: string): OpenAIService {
  const openai = new OpenAI({ apiKey });

  return {
    async sendPrompt(message: string, phoneNumber?: string, name?: string, historySummary?: string): Promise<string> {
      try {
        const systemPrompt = createSystemPrompt(phoneNumber, name, historySummary);
        const userPrompt = createUserPrompt(message);

        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
          throw new Error('No response received from OpenAI');
        }

        return response;
      } catch (error) {
        throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };
} 