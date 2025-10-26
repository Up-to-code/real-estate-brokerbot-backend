"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webhookHandlerDataExtraction_1 = __importDefault(require("../../services/webhook/webhookHandlerDataExtraction"));
const handleTextMessage_1 = require("./handleTextMessage");
const zod_1 = require("zod");
const WhatsAppWebhookSchema = zod_1.z.object({
    object: zod_1.z.string(),
    entry: zod_1.z.array(zod_1.z.any()),
});
const processedMessageIds = new Set();
const Handle_Message_webhook = async (req, res, next) => {
    try {
        const parseResult = WhatsAppWebhookSchema.safeParse(req.body);
        if (!parseResult.success) {
            console.error("Invalid webhook payload", parseResult.error);
            res.status(400).json({ error: "Invalid payload" });
            return;
        }
        const webhook = req.body;
        const result = (0, webhookHandlerDataExtraction_1.default)(webhook);
        if (result.messageId && processedMessageIds.has(result.messageId)) {
            console.log("Duplicate message detected, skipping:", result.messageId);
            res.status(200).json({ message: "Duplicate message ignored" });
            return;
        }
        if (result.messageId) {
            processedMessageIds.add(result.messageId);
            setTimeout(() => processedMessageIds.delete(result.messageId), 60 * 60 * 1000);
        }
        switch (result.messageType) {
            case "text":
                await (0, handleTextMessage_1.handleTextMessage)(result);
                break;
            default:
                console.log("Unhandled message type:", result.messageType);
        }
        res.status(200).json({ message: "Message received" });
    }
    catch (error) {
        console.error("Error in Handle_Message_webhook:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.default = Handle_Message_webhook;
