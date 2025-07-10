import { WhatsAppConfig, WhatsAppResponse, SendOptions } from './types';
import { makeApiRequest } from './httpClient';

/**
 * Sends a location
 */
export async function sendLocation(
  config: WhatsAppConfig,
  to: string,
  latitude: number,
  longitude: number,
  name?: string,
  address?: string,
  options: SendOptions = {}
): Promise<WhatsAppResponse> {
  const payload: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'location',
    location: { latitude, longitude }
  };

  if (name) payload.location.name = name;
  if (address) payload.location.address = address;
  if (options.replyToMessageId) payload.context = { message_id: options.replyToMessageId };

  return makeApiRequest(config, 'messages', payload);
}

/**
 * Sends a contact
 */
export async function sendContact(
  config: WhatsAppConfig,
  to: string,
  name: string,
  phone: string,
  email?: string,
  options: SendOptions = {}
): Promise<WhatsAppResponse> {
  const contact: any = {
    name: { formatted_name: name },
    phones: [{ phone, type: 'MOBILE' }]
  };

  if (email) {
    contact.emails = [{ email, type: 'HOME' }];
  }

  const payload: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'contacts',
    contacts: [contact]
  };

  if (options.replyToMessageId) {
    payload.context = { message_id: options.replyToMessageId };
  }

  return makeApiRequest(config, 'messages', payload);
} 