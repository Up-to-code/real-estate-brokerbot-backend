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
  sendPrompt(message: string, phoneNumber?: string, name?: string, historySummary?: string): Promise<string>;
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

  async sendPrompt(message: string, phoneNumber?: string, name?: string, historySummary?: string): Promise<string> {
    try {
      const systemPrompt = this.createSystemPrompt(phoneNumber, name, historySummary);
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

  private createSystemPrompt(phoneNumber?: string, name?: string, historySummary?: string): string {
    return `أنت وسيط عقاري محترف في شركة "اتجاه العقارية" في جدة، المملكة العربية السعودية.

معلومات المستخدم:
- رقم الجوال: ${phoneNumber || 'غير متوفر'}
${name ? `- الاسم: ${name}` : ''}
${historySummary ? `\nمعلومات سابقة عن المستخدم:\n${historySummary}` : ''}

يجب أن تكون ردودك بصيغة JSON بالهيكل التالي:
{
  "type": "answer" | "search" | "event",
  "content": "نص الرد",
  "query": { // إذا كان النوع search فقط
    "title": "عنوان العقار (اختياري، ويجب إعطاؤه أولوية إذا ذكر المستخدم اسم أو ميزة رئيسية، أو إذا ذكر المستخدم عبارة مركبة مثل 'فيلا فاخرة بأبحر الشمالية'، ضع 'فيلا' في type والباقي في title)",
    "description": "وصف العقار (اختياري)",
    "city": "اسم المدينة (اختياري)",
    "type": "نوع العقار (اختياري)",
    "minPrice": "أقل سعر (اختياري)",
    "maxPrice": "أعلى سعر (اختياري)",
    "minBedrooms": "أقل عدد غرف (اختياري)",
    "maxBedrooms": "أعلى عدد غرف (اختياري)",
    "minBathrooms": "أقل عدد حمامات (اختياري)",
    "maxBathrooms": "أعلى عدد حمامات (اختياري)",
    "minArea": "أقل مساحة (اختياري)",
    "maxArea": "أعلى مساحة (اختياري)",
    "furnished": "مفروش (اختياري)",
    "petFriendly": "يسمح بالحيوانات (اختياري)",
    "parking": "موقف سيارات (اختياري)",
    "yearBuilt": "سنة البناء (اختياري)",
    "address": "العنوان (اختياري)",
    "country": "الدولة (اختياري)"
  },
  "eventName": "اسم المناسبة إذا كان النوع event",
  "eventDetails": "تفاصيل المناسبة إذا كان النوع event"
}

مهم جداً: إذا كان نوع الرد "search"، يجب أن يكون الحقل 'query' دائماً كائن JSON (object) يحتوي فقط على الحقول التي ذكرها المستخدم في رسالته (ولا يكون أبداً نصاً أو جملة). إذا ذكر المستخدم اسم عقار أو ميزة رئيسية أو كلمة مفتاحية، ضعها في حقل 'title' وأعطها أولوية في البحث. إذا ذكر المستخدم عبارة مركبة مثل 'فيلا فاخرة بأبحر الشمالية'، استخرج نوع العقار (مثل 'فيلا') وضعه في 'type'، وضع باقي العبارة (مثل 'فاخرة بأبحر الشمالية') في 'title'.

مثال:
إذا كتب المستخدم: "أبحث عن فيلا فاخرة بأبحر الشمالية"
يجب أن يكون الرد:
{
  "type": "search",
  "content": "تم العثور على بعض الفلل الفاخرة في أبحر الشمالية...",
  "query": {
    "type": "فيلا",
    "title": "فاخرة بأبحر الشمالية"
  }
}

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
  // Helper: Map Arabic property type to enum
  private arabicTypeToEnum: Record<string, string> = {
    "فيلا": "VILLA",
    "شقة": "APARTMENT",
    "دور": "BUILDING",
    "استراحة": "LAND",
    "أرض": "LAND",
    "مخطط": "LAND",
    "تاون هاوس": "TOWNHOUSE",
    "بنتهاوس": "PENTHOUSE",
    "استوديو": "STUDIO",
    "مكتب": "OFFICE",
    "محل": "SHOP",
    "مستودع": "WAREHOUSE",
    "عمارة": "BUILDING"
  };

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
        // Map Arabic type to enum if present
        if (typeof parsed.query === 'object' && parsed.query !== null && 'type' in parsed.query && typeof (parsed.query as Record<string, any>).type === 'string') {
          const queryObj = parsed.query as Record<string, any>;
          const arType = queryObj.type.trim();
          if (this.arabicTypeToEnum[arType]) {
            queryObj.type = this.arabicTypeToEnum[arType];
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
}

// Main orchestrator function
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
  const openaiService: OpenAIService = new OpenAIServiceImpl(openaiApiKey);
  const responseParser: ResponseParser = new ResponseParserImpl();

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