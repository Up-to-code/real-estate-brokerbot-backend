"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOpenAIService = createOpenAIService;
const openai_1 = __importDefault(require("openai"));
const OpenAIServiceImpl_helpers_1 = require("./OpenAIServiceImpl.helpers");
function createOpenAIService(apiKey) {
    const openai = new openai_1.default({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKey,
        defaultHeaders: {
            "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
            "X-Title": process.env.SITE_NAME || "My AI App",
        },
    });
    return {
        async sendPrompt(message, phoneNumber, name, historySummary) {
            try {
                const systemPrompt = (0, OpenAIServiceImpl_helpers_1.createSystemPrompt)(phoneNumber, name, historySummary);
                const userPrompt = (0, OpenAIServiceImpl_helpers_1.createUserPrompt)(message);
                const completion = await openai.chat.completions.create({
                    model: 'minimax/minimax-m2:free',
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
            }
            catch (error) {
                throw new Error(`OpenRouter API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    };
}
