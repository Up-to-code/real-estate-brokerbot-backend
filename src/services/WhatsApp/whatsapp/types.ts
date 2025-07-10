// ==================================================
// TYPES & INTERFACES
// ==================================================

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  apiVersion?: string;
  baseUrl?: string;
  timeout?: number;
}

export interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string; message_status?: string }>;
}

export interface WhatsAppError {
  error: {
    message: string;
    code: number;
    type: string;
    fbtrace_id?: string;
  };
}

export interface SendOptions {
  replyToMessageId?: string;
  previewUrl?: boolean;
}

export interface InteractiveButton {
  id: string;
  title: string;
} 