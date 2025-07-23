/**
 * PDF Service Module - Main exports
 * 
 * This module provides a complete PDF generation and sending service
 * for real estate properties via WhatsApp.
 */

// Main service - Primary export
export { default as sendPropertyPDF } from './sendPropertyPDF';

// Types
export type { 
  Property, 
  SendPDFParams, 
  SendPDFResult, 
  WhatsAppMessageResponse, 
  PDFGenerationData 
} from './types';

// Utilities
export { 
  getMarketerRole, 
  validatePhoneNumber, 
  validateEnvironment,
  getPdfSizeInfo,
  isPdfSizeOptimal,
  shouldOptimizePdf
} from './utils';

// Core services
export { generatePDF } from './pdfGenerator';
export { uploadToWhatsApp } from './whatsappUploader';
export { sendWhatsAppMessage } from './whatsappMessenger';

// Configuration
export { 
  PHONE_NUMBER_ID, 
  WHATSAPP_TOKEN, 
  PDF_API_URL, 
  MAX_PDF_SIZE, 
  TIMEOUT_MS,
  UPLOAD_TIMEOUT_MS,
  MAX_RETRIES,
  RETRY_DELAY_MS
} from './config'; 