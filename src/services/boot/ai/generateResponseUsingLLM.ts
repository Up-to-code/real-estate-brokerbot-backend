import OpenAI from 'openai';

// Types
export type ProcessedResult = 
  | { type: 'answer'; text: string }
  | { type: 'search'; query: string }
  | { type: 'event'; name: string; details: string };

interface OpenAIResponse {
  type: 'answer' | 'search' | 'event';
  content: string;
  query?: string;
  eventName?: string;
  eventDetails?: string;
}

interface OpenAIService {
  sendPrompt(message: string): Promise<string>;
}

interface ResponseParser {
  parseResponse(response: string): ProcessedResult;
}

// OpenAI Service Implementation
class OpenAIServiceImpl implements OpenAIService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async sendPrompt(message: string): Promise<string> {
    try {
      const systemPrompt = this.createSystemPrompt();
      const userPrompt = this.createUserPrompt(message);

      const completion = await this.openai.chat.completions.create({
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

  private createSystemPrompt(): string {
    return `أنت وسيط عقاري محترف في شركة "اتجاه العقارية" في جدة، المملكة العربية السعودية.

يجب أن تكون ردودك بصيغة JSON بالهيكل التالي:
{
  "type": "answer" | "search" | "event",
  "content": "نص الرد",
  "query": "استعلام البحث إذا كان النوع search",
  "eventName": "اسم المناسبة إذا كان النوع event",
  "eventDetails": "تفاصيل المناسبة إذا كان النوع event"
}

أنواع الردود:
1. "answer": للأسئلة العقارية العامة، نصائح السوق، أو الاستفسارات المعلوماتية
2. "search": عندما يريد المستخدم البحث عن عقارات (ضع مصطلحات البحث ذات الصلة في "query")
3. "event": عندما يريد المستخدم جدولة شيء مثل المعاينة، مكالمة، اجتماع، إلخ

تعليمات مهمة:
- استخدم اللهجة السعودية الطبيعية والمألوفة
- كن مهذباً ومحترفاً مع الدفء الاجتماعي السعودي
- استخدم مصطلحات عقارية سعودية (مثل: فيلا، شقة، دور، استراحة، أرض، مخطط)
- اذكر مناطق جدة المعروفة عند الحاجة (الروضة، الحمراء، البلد، أبحر، المرجان، إلخ)
- استخدم العملة بالريال السعودي
- راعي الثقافة السعودية في التعامل (احترام، كرم ضيافة، اهتمام بالعائلة)
- استخدم عبارات مثل: "إن شاء الله"، "بإذنك"، "حياك الله"، "الله يعطيك العافية"

أمثلة على الرد:
- للترحيب: "حياك الله، أهلاً وسهلاً فيك"
- للاستفسار: "تسلم، وش تحتاج بالضبط؟"
- للشكر: "الله يعطيك العافية"
- للوعد: "إن شاء الله بنساعدك"`;
  }

  private createUserPrompt(message: string): string {
    return `رسالة العميل: "${message}"

يرجى تحليل هذه الرسالة والرد حسب التعليمات المذكورة أعلاه. استخدم اللهجة السعودية الطبيعية والمصطلحات العقارية المحلية.`;
  }
}

// Response Parser Implementation
class ResponseParserImpl implements ResponseParser {
  parseResponse(response: string): ProcessedResult {
    try {
      const parsed = this.parseJsonResponse(response);
      return this.mapToProcessedResult(parsed);
    } catch (error) {
      // Fallback: treat as general answer if parsing fails
      return {
        type: 'answer',
        text: 'I apologize, but I encountered an issue processing your request. Please try rephrasing your question.'
      };
    }
  }

  private parseJsonResponse(response: string): OpenAIResponse {
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

  private mapToProcessedResult(parsed: OpenAIResponse): ProcessedResult {
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
}

// Main orchestrator function
export async function processRealEstateMessage(
  message: string,
  openaiApiKey: string = process.env.OPENAI_API_KEY || ''
): Promise<ProcessedResult> {
  // Input validation
  if (!message?.trim()) {
    throw new Error('Message cannot be empty');
  }

  if (!openaiApiKey) {
    throw new Error('OpenAI API key is required');
  }

  // Dependency injection for better testability
  const openaiService: OpenAIService = new OpenAIServiceImpl(openaiApiKey);
  const responseParser: ResponseParser = new ResponseParserImpl();

  try {
    // Get AI response
    const aiResponse = await openaiService.sendPrompt(message);
    
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
  } as OpenAIService,
  
  responseParser: new ResponseParserImpl()
});

// Utility function to validate message content
export const isValidMessage = (message: string): boolean => {
  return typeof message === 'string' && message.trim().length > 0;
};

// Utility function to determine message language
export const detectLanguage = (message: string): 'ar' | 'en' => {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(message) ? 'ar' : 'en';
};