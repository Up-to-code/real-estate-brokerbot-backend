// Types
// In your type definition file
export interface WebhookQuery {
  "hub.mode"?: string;
  "hub.verify_token"?: string;
  "hub.challenge"?: string;
}

interface WhatsAppWebhook {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          type: string;
          status?: string;
          text?: {
            body: string;
          };
          // Additional message types
          image?: {
            caption?: string;
            mime_type: string;
            sha256: string;
            id: string;
          };
          video?: {
            caption?: string;
            mime_type: string;
            sha256: string;
            id: string;
          };
          audio?: {
            mime_type: string;
            sha256: string;
            id: string;
            voice?: boolean;
          };
          document?: {
            caption?: string;
            filename?: string;
            mime_type: string;
            sha256: string;
            id: string;
          };
          sticker?: {
            mime_type: string;
            sha256: string;
            id: string;
            animated?: boolean;
          };
          location?: {
            latitude: number;
            longitude: number;
            name?: string;
            address?: string;
          };
          contacts?: Array<{
            addresses?: Array<{
              street?: string;
              city?: string;
              state?: string;
              zip?: string;
              country?: string;
              country_code?: string;
              type?: string;
            }>;
            birthday?: string;
            emails?: Array<{
              email?: string;
              type?: string;
            }>;
            name: {
              formatted_name: string;
              first_name?: string;
              last_name?: string;
              middle_name?: string;
              suffix?: string;
              prefix?: string;
            };
            org?: {
              company?: string;
              department?: string;
              title?: string;
            };
            phones?: Array<{
              phone?: string;
              wa_id?: string;
              type?: string;
            }>;
            urls?: Array<{
              url?: string;
              type?: string;
            }>;
          }>;
          interactive?: {
            type: string;
            button_reply?: {
              id: string;
              title: string;
            };
            list_reply?: {
              id: string;
              title: string;
              description?: string;
            };
          };
          button?: {
            text: string;
            payload: string;
          };
          context?: {
            from: string;
            id: string;
            forwarded?: boolean;
            frequently_forwarded?: boolean;
          };
          reaction?: {
            message_id: string;
            emoji: string;
          };
          system?: {
            body: string;
            identity: string;
            wa_id: string;
            type: string;
            customer?: string;
          };
          errors?: Array<{
            code: number;
            title: string;
            message?: string;
            error_data?: {
              details: string;
            };
          }>;
        }>;
        // Status updates for sent messages
        statuses?: Array<{
          id: string;
          status: "sent" | "delivered" | "read" | "failed";
          timestamp: string;
          recipient_id: string;
          conversation?: {
            id: string;
            expiration_timestamp?: string;
            origin: {
              type: string;
            };
          };
          pricing?: {
            billable: boolean;
            pricing_model: string;
            category: string;
          };
          errors?: Array<{
            code: number;
            title: string;
            message?: string;
            error_data?: {
              details: string;
            };
          }>;
        }>;
      };
      field: string;
    }>;
  }>;
}

export { WebhookQuery, WhatsAppWebhook };
