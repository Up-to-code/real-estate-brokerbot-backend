// WhatsApp Business API Types based on Facebook Documentation
export interface WhatsAppComponent {
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    text?: string;
    example?: {
      header_text?: string[];
      body_text?: string[][];
    };
    buttons?: WhatsAppButton[];
  }
  
  export interface WhatsAppButton {
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    url?: string;
    phone_number?: string;
  }
  
  export interface WhatsAppTemplate {
    name: string;
    category: 'AUTHENTICATION' | 'MARKETING' | 'UTILITY';
    language: string;
    components: WhatsAppComponent[];
  }
  
  export interface WhatsAppParameter {
    type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
    text?: string;
    currency?: {
      fallback_value: string;
      code: string;
      amount_1000: number;
    };
    date_time?: {
      fallback_value: string;
    };
    image?: {
      link: string;
    };
    document?: {
      link: string;
      filename?: string;
    };
    video?: {
      link: string;
    };
  }
  
  export interface WhatsAppMessageComponent {
    type: 'header' | 'body' | 'button';
    sub_type?: 'quick_reply' | 'url';
    index?: number;
    parameters: WhatsAppParameter[];
  }
  
  export interface WhatsAppMessagePayload {
    messaging_product: 'whatsapp';
    to: string;
    type: 'template';
    template: {
      name: string;
      language: {
        code: string;
      };
      components?: WhatsAppMessageComponent[];
    };
  }

  
  export interface WhatsAppBusinessAPI {
    sendMessage(message: WhatsAppMessagePayload): Promise<void>;
  }

  export interface WhatsAppBusinessAPI {
    sendMessage(message: WhatsAppMessagePayload): Promise<void>;
  }

   