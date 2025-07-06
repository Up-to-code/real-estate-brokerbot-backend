"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generateResponseUsingLLM_1 = require("./ai/generateResponseUsingLLM");
const findRelevantQAPairs_1 = __importDefault(require("./findRelevantQAPairs"));
const searchProperties_1 = require("./services/searchProperties");
async function generateResponse(message) {
    const { results: relevantQAs } = await (0, findRelevantQAPairs_1.default)(message);
    if (relevantQAs.length > 0) {
        console.log("relevantQAs", relevantQAs);
    }
    const response = await (0, generateResponseUsingLLM_1.processRealEstateMessage)(message);
    if (response.type === "answer") {
        console.log("response", response.text);
        return response.text;
    }
    if (response.type === "search") {
        console.log("response", response.query);
        const properties = await (0, searchProperties_1.searchProperties)(response.query);
        console.log("properties", properties);
        return response.query;
    }
    if (response.type === "event") {
        console.log("response", response.details);
        return response.details;
    }
    return "No response found";
}
exports.default = generateResponse;
