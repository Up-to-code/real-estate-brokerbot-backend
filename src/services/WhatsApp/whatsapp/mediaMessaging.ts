import { WhatsAppConfig, WhatsAppResponse, SendOptions } from './types';
import { makeApiRequest } from './httpClient';
import { sendTextWithTypingEffect } from './textMessaging';
import { extractFilenameFromUrl, getFileExtension } from './utils';

/**
 * Sends an image with optional caption
 */
export async function sendImage(
  config: WhatsAppConfig,
  to: string,
  imageUrl: string,
  caption?: string,
  options: SendOptions = {}
): Promise<WhatsAppResponse> {
  const payload: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'image',
    image: {
      link: imageUrl, // WhatsApp API expects 'link', not 'url'
      ...(caption && { caption })
    }
  };

  if (options.replyToMessageId) {
    payload.context = { message_id: options.replyToMessageId };
  }

  return makeApiRequest(config, 'messages', payload);
}

/**
 * Sends an image with text caption and typing effect
 * Combines image sending with natural text effect
 */
export async function sendImageWithText(
  config: WhatsAppConfig,
  to: string,
  imageUrl: string,
  text: string,
  options: SendOptions & { typingSpeed?: number } = {}
): Promise<{ image: WhatsAppResponse; text: WhatsAppResponse[] }> {
  // Send image first
  const imageResponse = await sendImage(config, to, imageUrl, undefined, options);
  
  // Wait a moment, then send text with typing effect
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const textResponses = await sendTextWithTypingEffect(config, to, text, {
    typingSpeed: options.typingSpeed
  });

  return {
    image: imageResponse,
    text: textResponses
  };
}

/**
 * Sends a document
 */
export async function sendDocument(
  config: WhatsAppConfig,
  to: string,
  documentUrl: string,
  filename?: string,
  caption?: string,
  options: SendOptions = {}
): Promise<WhatsAppResponse> {
  const payload: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'document',
    document: {
      url: documentUrl,
      ...(filename && { filename }),
      ...(caption && { caption })
    }
  };

  if (options.replyToMessageId) {
    payload.context = { message_id: options.replyToMessageId };
  }

  return makeApiRequest(config, 'messages', payload);
}

/**
 * Sends a video
 */
export async function sendVideo(
  config: WhatsAppConfig,
  to: string,
  videoUrl: string,
  caption?: string,
  options: SendOptions = {}
): Promise<WhatsAppResponse> {
  const payload: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'video',
    video: {
      url: videoUrl,
      ...(caption && { caption })
    }
  };

  if (options.replyToMessageId) {
    payload.context = { message_id: options.replyToMessageId };
  }

  return makeApiRequest(config, 'messages', payload);
}

/**
 * Sends an audio message
 */
export async function sendAudio(
  config: WhatsAppConfig,
  to: string,
  audioUrl: string,
  options: SendOptions = {}
): Promise<WhatsAppResponse> {
  const payload: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'audio',
    audio: {
      url: audioUrl
    }
  };

  if (options.replyToMessageId) {
    payload.context = { message_id: options.replyToMessageId };
  }

  return makeApiRequest(config, 'messages', payload);
}

/**
 * Sends any type of file (PDF, DOC, XLS, etc.)
 * Automatically detects file type and sets appropriate MIME type
 */
export async function sendFile(
  config: WhatsAppConfig,
  to: string,
  fileUrl: string,
  filename?: string,
  caption?: string,
  options: SendOptions = {}
): Promise<WhatsAppResponse> {
  // Auto-detect file type from URL or filename
  const detectedFilename = filename || extractFilenameFromUrl(fileUrl);
  const fileExtension = getFileExtension(detectedFilename);
  
  const payload: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'document',
    document: {
      url: fileUrl,
      filename: detectedFilename,
      ...(caption && { caption })
    }
  };

  if (options.replyToMessageId) {
    payload.context = { message_id: options.replyToMessageId };
  }

  return makeApiRequest(config, 'messages', payload);
}

/**
 * Sends a PDF file specifically
 */
export async function sendPDF(
  config: WhatsAppConfig,
  to: string,
  pdfUrl: string,
  filename?: string,
  caption?: string,
  options: SendOptions = {}
): Promise<WhatsAppResponse> {
  const pdfFilename = filename || extractFilenameFromUrl(pdfUrl) || 'document.pdf';
  
  return sendFile(config, to, pdfUrl, pdfFilename, caption, options);
}

/**
 * Sends multiple files in sequence
 */
export async function sendMultipleFiles(
  config: WhatsAppConfig,
  to: string,
  files: Array<{
    url: string;
    filename?: string;
    caption?: string;
  }>,
  options: SendOptions & { delayBetweenFiles?: number } = {}
): Promise<WhatsAppResponse[]> {
  const responses: WhatsAppResponse[] = [];
  const delay = options.delayBetweenFiles || 1000; // 1 second default

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Add delay between files (except for the first one)
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    const response = await sendFile(
      config,
      to,
      file.url,
      file.filename,
      file.caption,
      {
        // Only reply to the first file
        replyToMessageId: i === 0 ? options.replyToMessageId : undefined
      }
    );
    
    responses.push(response);
  }

  return responses;
} 

/**
 * Sends a group of images to a WhatsApp user as a "gallery" (sequentially).
 * @param config WhatsApp API config
 * @param to The WhatsApp number to send to
 * @param imageUrls Array of image URLs
 * @param options Optional SendOptions (can include delayBetweenImages in ms)
 */
export async function sendImagesGroup(
  config: WhatsAppConfig,
  to: string,
  imageUrls: string[],
  options: SendOptions & { delayBetweenImages?: number } = {}
): Promise<WhatsAppResponse[]> {
  const responses: WhatsAppResponse[] = [];
  const delay = options.delayBetweenImages || 300; // 300ms default

  for (let i = 0; i < imageUrls.length; i++) {
    if (i > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    const response = await sendImage(
      config,
      to,
      imageUrls[i],
      undefined,
      {
        replyToMessageId: i === 0 ? options.replyToMessageId : undefined
      }
    );
    responses.push(response);
  }
  return responses;
} 