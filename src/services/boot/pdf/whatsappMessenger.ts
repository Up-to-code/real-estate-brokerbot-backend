/**
 * WhatsApp Messenger Service
 * 
 * Handles sending PDF documents via WhatsApp Business API.
 */

import fetch from 'node-fetch';
import { Property, WhatsAppMessageResponse } from './types';
import { PHONE_NUMBER_ID, WHATSAPP_TOKEN, TIMEOUT_MS } from './config';

/**
 * Send WhatsApp message with PDF
 * @param phoneNumber - The recipient's phone number
 * @param mediaId - The media ID from WhatsApp upload
 * @param property - The property data for the message caption
 * @returns Promise<string> - The message ID returned by WhatsApp
 * @throws Error if message sending fails or times out
 */
export async function sendWhatsAppMessage(
  phoneNumber: string, 
  mediaId: string, 
  property: Property
): Promise<string> {
  console.log('💬 Sending WhatsApp message...');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'document',
          document: {
            id: mediaId,
            filename: `${property.title || 'property'}.pdf`,
            caption: `تفاصيل العقار: ${property.title || 'عقار مميز'}\n${property.marketer.name} - ${property.marketer.role}`
          }
        }),
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    
    const result = await response.json() as WhatsAppMessageResponse;
    
    if (!response.ok || result.error) {
      const errorMsg = result.error?.message || `Request failed: ${response.status}`;
      throw new Error(errorMsg);
    }
    
    const messageId = result.messages?.[0]?.id;
    if (!messageId) {
      throw new Error('No message ID returned from WhatsApp');
    }
    
    console.log('✅ Message sent successfully, ID:', messageId);
    return messageId;
    
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Message sending timed out');
    }
    
    throw error;
  }
} 