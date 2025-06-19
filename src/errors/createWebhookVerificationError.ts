interface WebhookVerificationError extends Error {
  name: "WebhookVerificationError";
  message: string;
}

export const createWebhookVerificationError = (
  message: string
): WebhookVerificationError => {
  const error = new Error(message) as WebhookVerificationError;
  error.name = "WebhookVerificationError";
  return error;
};
