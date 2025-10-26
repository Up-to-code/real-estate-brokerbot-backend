"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generateResponse_1 = __importDefault(require("../boot/generateResponse"));
const findClientByPhoneNumberOrCreate_1 = __importDefault(require("../Client/findClientByPhoneNumberOrCreate"));
const saveMessageToDb_1 = __importDefault(require("../Client/saveMessageToDb"));
const generatePRopertyPdf_1 = __importDefault(require("../boot/pdf/generatePRopertyPdf"));
const historyUtils_1 = require("../boot/ai/utils/historyUtils");
function isPdfRequest(message) {
    if (!message)
        return false;
    const lowered = message.toLowerCase();
    const pdfWords = [
        "pdf", "بي دي اف", "ملف", "سوي لي pdf", "ابي pdf", "أريد pdf", "ملف للعقار", "ملف عقار", "ملف بي دي اف", "send pdf", "create pdf"
    ];
    return pdfWords.some(word => lowered.includes(word));
}
async function processWhatsAppTextMessage(whatsappClient) {
    const client = await (0, findClientByPhoneNumberOrCreate_1.default)(whatsappClient);
    await (0, saveMessageToDb_1.default)(whatsappClient, client);
    const response = await (0, generateResponse_1.default)(whatsappClient.message, client.phoneNumber, client.name);
    if (response &&
        response.type === "event" &&
        (response.name === "generate_property_pdf" || response.eventName === "generate_property_pdf") &&
        response.details &&
        response.details.propertyId &&
        response.details.phone) {
        return await (0, generatePRopertyPdf_1.default)({
            type: "event",
            name: response.details.name || client.name || "عميل",
            details: {
                propertyId: response.details.propertyId,
                phone: response.details.phone,
                name: response.details.name || client.name || "عميل"
            }
        });
    }
    if (isPdfRequest(whatsappClient.message)) {
        const { summary: historySummary } = await (0, historyUtils_1.buildHistorySummary)(client.phoneNumber);
        const lastPropertyIdMatch = historySummary.match(/propertyId: ([a-zA-Z0-9\-]+)/);
        const lastPropertyId = lastPropertyIdMatch ? lastPropertyIdMatch[1] : undefined;
        if (lastPropertyId) {
            return await (0, generatePRopertyPdf_1.default)({
                type: "event",
                name: client.name || "عميل",
                details: {
                    propertyId: lastPropertyId,
                    phone: client.phoneNumber,
                    name: client.name || "عميل"
                }
            });
        }
        else {
            return { success: false, message: "لم يتم العثور على آخر عقار بحثت عنه. يرجى البحث عن عقار أولاً." };
        }
    }
    return response;
}
exports.default = processWhatsAppTextMessage;
