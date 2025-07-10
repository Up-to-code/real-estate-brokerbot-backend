import { WhatsAppConfig, WhatsAppResponse, SendOptions } from './types';
import { makeApiRequest } from './httpClient';

/**
 * Sends a simple text message
 */
export async function sendText(
  config: WhatsAppConfig,
  to: string,
  message: string,
  options: SendOptions = {}
): Promise<WhatsAppResponse> {
  const payload: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: {
      preview_url: options.previewUrl || false,
      body: message
    }
  };

  // Add reply context if provided
  if (options.replyToMessageId) {
    payload.context = { message_id: options.replyToMessageId };
  }

  return makeApiRequest(config, 'messages', payload);
}

/**
 * Sends text with natural typing effect
 * Splits message into sentences and sends with delays
 */
export async function sendTextWithTypingEffect(
  config: WhatsAppConfig,
  to: string,
  message: string,
  options: SendOptions & { typingSpeed?: number } = {}
): Promise<WhatsAppResponse[]> {
  const typingSpeed = options.typingSpeed || 40; // Words per minute
  const responses: WhatsAppResponse[] = [];
  
  // Split message into sentences
  const sentences = message
    .split(/[.!?]+/)
    .filter(s => s.trim())
    .map(s => s.trim() + '.');

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const words = sentence.split(' ').length;
    const delay = (words / typingSpeed) * 60000; // Convert WPM to milliseconds
    
    // Wait before sending (simulate typing)
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Send sentence
    const response = await sendText(config, to, sentence, {
      replyToMessageId: i === 0 ? options.replyToMessageId : undefined,
      previewUrl: options.previewUrl
    });
     console.log("response from sendText ", response);
    responses.push(response);
    
    // Pause between sentences
    if (i < sentences.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }

  return responses;
} 