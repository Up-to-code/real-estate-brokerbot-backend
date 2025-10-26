"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockServices = void 0;
exports.processRealEstateMessage = processRealEstateMessage;
const OpenAIServiceImpl_1 = require("./services/OpenAIServiceImpl");
const ResponseParserImpl_1 = require("./services/ResponseParserImpl");
async function processRealEstateMessage(message, openaiApiKey = process.env.OPENAI_API_KEY || '', phoneNumber, name, historySummary) {
    console.log(historySummary ? `historySummary: ${historySummary}` : 'no historySummary');
    if (!message?.trim()) {
        throw new Error('Message cannot be empty');
    }
    if (!openaiApiKey) {
        throw new Error('OpenAI API key is required');
    }
    const openaiService = (0, OpenAIServiceImpl_1.createOpenAIService)(openaiApiKey);
    const responseParser = (0, ResponseParserImpl_1.createResponseParser)();
    try {
        const aiResponse = await openaiService.sendPrompt(message, phoneNumber, name, historySummary);
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
    responseParser: (0, ResponseParserImpl_1.createResponseParser)()
});
exports.createMockServices = createMockServices;
