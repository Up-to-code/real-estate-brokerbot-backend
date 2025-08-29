/**
 * WhatsApp Upload Service
 * 
 * Handles PDF upload to WhatsApp Media API with retry logic and error handling.
 */

import FormData from 'form-data';
import axios from 'axios';
import { PHONE_NUMBER_ID, WHATSAPP_TOKEN, UPLOAD_TIMEOUT_MS, MAX_RETRIES, RETRY_DELAY_MS } from './config';

/**
 * Sleep utility for retry delays
 * @param ms - Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Upload PDF to WhatsApp Media API with retry logic
 * @param pdfBuffer - The PDF buffer to upload
 * @returns Promise<string> - The media ID returned by WhatsApp
 * @throws Error if upload fails after all retries
 */
export async function uploadToWhatsApp(pdfBuffer: Buffer): Promise<string> {
  console.log('📤 Uploading to WhatsApp...');
  console.log(`📊 File size: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)}MB`);
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔄 Upload attempt ${attempt}/${MAX_RETRIES}`);
      
      const form = new FormData();
      form.append('messaging_product', 'whatsapp');
      form.append('file', pdfBuffer, {
        filename: `property_${Date.now()}.pdf`,
        contentType: 'application/pdf'
      });
      
      const uploadResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/media`,
        form,
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            ...form.getHeaders()
          },
          timeout: UPLOAD_TIMEOUT_MS,
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );
      
      const mediaId = uploadResponse.data.id;
      if (!mediaId) {
        throw new Error('No media ID returned from WhatsApp');
      }
      
      console.log('✅ PDF uploaded successfully, media ID:', mediaId);
      return mediaId;
      
    } catch (error) {
      lastError = error as Error;
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.error?.message || error.message;
        
        // Don't retry on certain errors
        if (status === 400 || status === 401 || status === 403) {
          throw new Error(`Upload failed (${status}): ${message}`);
        }
        
        console.log(`⚠️ Upload attempt ${attempt} failed (${status}): ${message}`);
        
        if (attempt < MAX_RETRIES) {
          console.log(`⏳ Waiting ${RETRY_DELAY_MS}ms before retry...`);
          await sleep(RETRY_DELAY_MS);
        }
      } else {
        console.log(`⚠️ Upload attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < MAX_RETRIES) {
          console.log(`⏳ Waiting ${RETRY_DELAY_MS}ms before retry...`);
          await sleep(RETRY_DELAY_MS);
        }
      }
    }
  }
  
  // All retries failed
  const errorMessage = lastError?.message || 'Unknown upload error';
  throw new Error(`Upload failed after ${MAX_RETRIES} attempts: ${errorMessage}`);
} 