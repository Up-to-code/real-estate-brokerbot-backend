import { WhatsAppConfig, WhatsAppResponse, SendOptions, InteractiveButton } from './types';
import { makeApiRequest } from './httpClient';

/**
 * Sends interactive buttons
 */
export async function sendButtons(
  config: WhatsAppConfig,
  to: string,
  bodyText: string,
  buttons: InteractiveButton[],
  options: SendOptions & { headerText?: string; footerText?: string } = {}
): Promise<WhatsAppResponse> {
  const payload: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.map(btn => ({
          type: 'reply',
          reply: { id: btn.id, title: btn.title }
        }))
      }
    }
  };

  if (options.headerText) {
    payload.interactive.header = { type: 'text', text: options.headerText };
  }
  if (options.footerText) {
    payload.interactive.footer = { text: options.footerText };
  }
  if (options.replyToMessageId) {
    payload.context = { message_id: options.replyToMessageId };
  }

  return makeApiRequest(config, 'messages', payload);
}

/**
 * Sends interactive list
 */
export async function sendList(
  config: WhatsAppConfig,
  to: string,
  bodyText: string,
  buttonText: string,
  sections: Array<{
    title?: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>,
  options: SendOptions & { headerText?: string; footerText?: string } = {}
): Promise<WhatsAppResponse> {
  const payload: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: bodyText },
      action: {
        button: buttonText,
        sections
      }
    }
  };

  if (options.headerText) {
    payload.interactive.header = { type: 'text', text: options.headerText };
  }
  if (options.footerText) {
    payload.interactive.footer = { text: options.footerText };
  }
  if (options.replyToMessageId) {
    payload.context = { message_id: options.replyToMessageId };
  }

  return makeApiRequest(config, 'messages', payload);
} 