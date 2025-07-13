export function logIncomingMessage(message: string) {
  console.log('[DEBUG] Incoming message:', message);
}

export function logLLMResponse(response: any) {
  console.log('[DEBUG] LLM response:', response);
} 