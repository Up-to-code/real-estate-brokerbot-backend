"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function webhookHandlerDataExtraction(webhook) {
    const name = webhook.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name ??
        "No name";
    const message = webhook.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body ??
        "No message content";
    const sender = webhook.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id ??
        "No sender";
    const receiver = webhook.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number ??
        "No receiver";
    const timestamp = webhook.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.timestamp ??
        "No timestamp";
    const messageId = webhook.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id ??
        "No message ID";
    const messageType = webhook.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.type ??
        "No message type";
    const messageStatus = webhook.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.status ??
        "No message status";
    return {
        status: "Message received",
        message,
        sender,
        receiver,
        timestamp,
        messageId,
        messageType,
        messageStatus,
        name,
    };
}
exports.default = webhookHandlerDataExtraction;
