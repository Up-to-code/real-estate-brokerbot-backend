// ==================================================
// CUSTOM ERROR CLASS
// ==================================================

export class WhatsAppAPIError extends Error {
  constructor(
    message: string,
    public code: number,
    public type?: string,
    public fbtrace_id?: string
  ) {
    super(message);
    this.name = 'WhatsAppAPIError';
  }
} 