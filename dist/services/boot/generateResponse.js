"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logMessage_1 = require("./ai/utils/logMessage");
const historyUtils_1 = require("./ai/utils/historyUtils");
const ai_1 = require("./ai");
const propertySearch_1 = require("./ai/utils/propertySearch");
const prisma_1 = require("../../lib/prisma");
const generatePRopertyPdf_1 = __importDefault(require("./pdf/generatePRopertyPdf"));
async function generateResponse(message, phoneNumber, name) {
    (0, logMessage_1.logIncomingMessage)(message);
    const { summary: historySummary, clientId } = await (0, historyUtils_1.buildHistorySummary)(phoneNumber);
    console.log("historySummary", historySummary);
    const response = await (0, ai_1.processRealEstateMessage)(message, undefined, phoneNumber, name);
    (0, logMessage_1.logLLMResponse)(response);
    if (clientId) {
        await prisma_1.prisma.userMessageHistory.create({
            data: {
                clientId,
                message,
                responseType: response.type,
                llmResponse: JSON.stringify(response),
            },
        });
    }
    if (response.type === "answer")
        return response.text;
    if (response.type === "search") {
        return await (0, propertySearch_1.handleSearch)(response.query, clientId);
    }
    if (response.type === "event") {
        if (response.name === "generate_property_pdf") {
            console.log("handleGeneratePropertyPdfEvent", response);
            if (response.details.name && response.details.propertyId) {
                const pdf = await (0, generatePRopertyPdf_1.default)({
                    type: "event",
                    name: response.details.name,
                    details: response.details,
                });
                return pdf;
            }
        }
    }
    if (response.type === "reminder") {
        console.log("handleReminderEvent", response);
    }
    return "No response found";
}
exports.default = generateResponse;
