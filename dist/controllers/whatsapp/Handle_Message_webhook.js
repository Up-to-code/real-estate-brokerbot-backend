"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webhookHandlerDataExtraction_1 = __importDefault(require("../../services/webhook/webhookHandlerDataExtraction"));
const processWhatsAppTextMessage_1 = __importDefault(require("../../services/WhatsApp/processWhatsAppTextMessage"));
const whatsapp_1 = require("../../services/WhatsApp/whatsapp");
const Handle_Message_webhook = async (req, res, next) => {
    try {
        const webhook = req.body;
        console.log("🔥 Incoming webhook received");
        const result = (0, webhookHandlerDataExtraction_1.default)(webhook);
        console.log("🧪 result.messageType:", result.name);
        if (result.messageType === "text") {
            console.log("💬 Processing text message");
            if (result.messageId) {
                await (0, whatsapp_1.markAsRead)(whatsapp_1.DEFAULT_CONFIG, result.messageId);
            }
            const response = await (0, processWhatsAppTextMessage_1.default)(result);
            console.log("🎯 Response from processor:", response);
            await (0, whatsapp_1.sendText)(whatsapp_1.DEFAULT_CONFIG, result.sender, response);
        }
        res.status(200).json({ message: "Message received" });
    }
    catch (error) {
        console.error("Error in Handle_Message_webhook:", error);
        next(error);
    }
};
exports.default = Handle_Message_webhook;
