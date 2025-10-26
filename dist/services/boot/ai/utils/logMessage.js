"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logIncomingMessage = logIncomingMessage;
exports.logLLMResponse = logLLMResponse;
function logIncomingMessage(message) {
    console.log('[DEBUG] Incoming message:', message);
}
function logLLMResponse(response) {
    console.log('[DEBUG] LLM response:', response);
}
