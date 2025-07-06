"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webhookHandlerDataExtraction_1 = __importDefault(require("../../services/webhook/webhookHandlerDataExtraction"));
const processWhatsAppTextMessage_1 = __importDefault(require("../../services/WhatsApp/processWhatsAppTextMessage"));
const Handle_Message_webhook = (req, res, next) => {
    try {
        const webhook = req.body;
        const result = (0, webhookHandlerDataExtraction_1.default)(webhook);
        if (result.messageType === "text") {
            (0, processWhatsAppTextMessage_1.default)(result);
        }
        res.status(200).json({ message: "Message received" });
    }
    catch (error) {
        next(error);
    }
};
exports.default = Handle_Message_webhook;
