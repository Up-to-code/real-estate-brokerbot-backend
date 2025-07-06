"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generateResponse_1 = __importDefault(require("../boot/generateResponse"));
const findClientByPhoneNumberOrCreate_1 = __importDefault(require("../Client/findClientByPhoneNumberOrCreate"));
const saveMessageToDb_1 = __importDefault(require("../Client/saveMessageToDb"));
async function processWhatsAppTextMessage(whatsappClient) {
    const client = await (0, findClientByPhoneNumberOrCreate_1.default)(whatsappClient);
    const message = await (0, saveMessageToDb_1.default)(whatsappClient, client);
    const response = await (0, generateResponse_1.default)(whatsappClient.message);
    return response;
}
exports.default = processWhatsAppTextMessage;
