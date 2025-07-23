/**
 * PDF Service Configuration
 * 
 * Centralized configuration for PDF generation and WhatsApp upload functionality.
 */

// WhatsApp API Configuration
export const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
export const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// PDF Generation Configurationhttp://localhost:3000/
export const PDF_API_URL = process.env.PDF_API_URL || "https://pdf-ar-production.up.railway.app/generate-pdf";

// File Size Limits
export const MAX_PDF_SIZE = 100 * 1024 * 1024; // 100MB WhatsApp limit

// Timeout Configuration
export const TIMEOUT_MS = 30000; // 30 seconds for PDF generation
export const UPLOAD_TIMEOUT_MS = 120000; // 2 minutes for WhatsApp uploads

// Retry Configuration
export const MAX_RETRIES = 3; // Maximum retry attempts for uploads
export const RETRY_DELAY_MS = 2000; // Delay between retries 