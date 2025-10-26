"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTextMessage = handleTextMessage;
const whatsapp_1 = require("../../services/WhatsApp/whatsapp");
const processWhatsAppTextMessage_1 = __importDefault(require("../../services/WhatsApp/processWhatsAppTextMessage"));
const sendPropertyResult_1 = require("./sendPropertyResult");
async function handleTextMessage(result) {
    console.log("💬 Processing text message");
    if (result.messageId) {
        await (0, whatsapp_1.markAsRead)(whatsapp_1.DEFAULT_CONFIG, result.messageId);
    }
    const response = await (0, processWhatsAppTextMessage_1.default)(result);
    console.log("🎯 Response from processor:", response);
    if (typeof response === "string") {
        await (0, whatsapp_1.sendText)(whatsapp_1.DEFAULT_CONFIG, result.sender, response);
    }
    if (typeof response === "object" &&
        response &&
        Array.isArray(response.properties)) {
        await (0, sendPropertyResult_1.sendPropertyResult)(response, result.sender);
    }
}
