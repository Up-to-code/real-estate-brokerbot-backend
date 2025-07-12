import { ProcessedResult } from './types/aiTypes';
import { createOpenAIService } from './services/OpenAIServiceImpl';
import { createResponseParser } from './services/ResponseParserImpl';

export async function processRealEstateMessage(
  message: string,
  openaiApiKey: string = process.env.OPENAI_API_KEY || '',
  phoneNumber?: string,
  name?: string,
  historySummary?: string
): Promise<ProcessedResult> {
  // Input validation
  if (!message?.trim()) {
    throw new Error('Message cannot be empty');
  }

  if (!openaiApiKey) {
    throw new Error('OpenAI API key is required');
  }

  // Dependency injection for better testability
  const openaiService = createOpenAIService(openaiApiKey);
  const responseParser = createResponseParser();

  try {
    // Get AI response
    const aiResponse = await openaiService.sendPrompt(message, phoneNumber, name, historySummary);
    // Parse and return structured result
    return responseParser.parseResponse(aiResponse);
  } catch (error) {
    // Graceful error handling
    console.error('Error processing real estate message:', error);
    return {
      type: 'answer',
      text: 'معذرة، صار عندي خطأ في معالجة طلبك. يرجى المحاولة مرة ثانية، والله يعطيك العافية.'
    };
  }
}

// Example usage and helper functions for testing
export const createMockServices = () => ({
  openaiService: {
    sendPrompt: async (message: string) => {
      // Mock implementation for testing
      return JSON.stringify({
        type: 'answer',
        content: 'حياك الله، هذا رد تجريبي للاختبار. كيف ممكن أساعدك اليوم؟'
      });
    }
  },
  responseParser: createResponseParser()
}); 