"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLanguage = exports.isValidMessage = exports.createMockServices = void 0;
exports.processRealEstateMessage = processRealEstateMessage;
const openai_1 = __importDefault(require("openai"));
class OpenAIServiceImpl {
    openai;
    constructor(apiKey) {
        this.openai = new openai_1.default({ apiKey });
    }
    async sendPrompt(message) {
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
        }
        catch (error) {
            throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    createSystemPrompt() {
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
    createUserPrompt(message) {
        return `رسالة العميل: "${message}"

يرجى تحليل هذه الرسالة والرد حسب التعليمات المذكورة أعلاه. استخدم اللهجة السعودية الطبيعية والمصطلحات العقارية المحلية.`;
    }
}
class ResponseParserImpl {
    parseResponse(response) {
        try {
            const parsed = this.parseJsonResponse(response);
            return this.mapToProcessedResult(parsed);
        }
        catch (error) {
            return {
                type: 'answer',
                text: 'I apologize, but I encountered an issue processing your request. Please try rephrasing your question.'
            };
        }
    }
    parseJsonResponse(response) {
        try {
            return JSON.parse(response);
        }
        catch {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No valid JSON found in response');
        }
    }
    mapToProcessedResult(parsed) {
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
async function processRealEstateMessage(message, openaiApiKey = process.env.OPENAI_API_KEY || '') {
    if (!message?.trim()) {
        throw new Error('Message cannot be empty');
    }
    if (!openaiApiKey) {
        throw new Error('OpenAI API key is required');
    }
    const openaiService = new OpenAIServiceImpl(openaiApiKey);
    const responseParser = new ResponseParserImpl();
    try {
        const aiResponse = await openaiService.sendPrompt(message);
        return responseParser.parseResponse(aiResponse);
    }
    catch (error) {
        console.error('Error processing real estate message:', error);
        return {
            type: 'answer',
            text: 'معذرة، صار عندي خطأ في معالجة طلبك. يرجى المحاولة مرة ثانية، والله يعطيك العافية.'
        };
    }
}
const createMockServices = () => ({
    openaiService: {
        sendPrompt: async (message) => {
            return JSON.stringify({
                type: 'answer',
                content: 'حياك الله، هذا رد تجريبي للاختبار. كيف ممكن أساعدك اليوم؟'
            });
        }
    },
    responseParser: new ResponseParserImpl()
});
exports.createMockServices = createMockServices;
const isValidMessage = (message) => {
    return typeof message === 'string' && message.trim().length > 0;
};
exports.isValidMessage = isValidMessage;
const detectLanguage = (message) => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(message) ? 'ar' : 'en';
};
exports.detectLanguage = detectLanguage;
