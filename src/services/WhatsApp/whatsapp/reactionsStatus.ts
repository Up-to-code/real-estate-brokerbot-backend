import { WhatsAppConfig, WhatsAppResponse } from './types';
import { makeApiRequest } from './httpClient';

/**
 * Sends a reaction to a message
 */
export async function sendReaction(
  config: WhatsAppConfig,
  to: string,
  messageId: string,
  emoji: string
): Promise<WhatsAppResponse> {
  const payload = {
    messaging_product: 'whatsapp',
    to,
    type: 'reaction',
    reaction: {
      message_id: messageId,
      emoji
    }
  };

  return makeApiRequest(config, 'messages', payload);
}

/**
 * Removes a reaction from a message
 */
export async function removeReaction(
  config: WhatsAppConfig,
  to: string,
  messageId: string
): Promise<WhatsAppResponse> {
  return sendReaction(config, to, messageId, '');
}

/**
 * Marks a message as read
 */
export async function markAsRead(
  config: WhatsAppConfig,
  messageId: string
): Promise<{ success: boolean }> {
  const payload = {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId
  };

  await makeApiRequest(config, 'messages', payload);
  return { success: true };
} 