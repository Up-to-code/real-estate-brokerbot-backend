/**
 * PDF Service Types
 * 
 * Type definitions for PDF generation and WhatsApp messaging functionality.
 */

/**
 * Property data structure for PDF generation
 */
export interface Property {
  id?: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  location: string;
  city: string;
  country: string;
  images: string[];
  features: string[];
  yearBuilt: number;
  parking: number;
  contactInfo: string;
  marketer: {
    name: string;
    role: string;
  };
}

/**
 * Parameters for sending PDF via WhatsApp
 */
export interface SendPDFParams {
  property: Property;
  phoneNumber: string;
}

/**
 * Result of PDF sending operation
 */
export interface SendPDFResult {
  success: boolean;
  messageId?: string;
  mediaId?: string;
  fileSize?: string;
  error?: string;
  errorCode?: string;
}

/**
 * WhatsApp API message response structure
 */
export interface WhatsAppMessageResponse {
  messages?: Array<{
    id: string;
    message_status: string;
  }>;
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

/**
 * Enhanced property data for PDF generation with additional fields
 */
export interface PDFGenerationData extends Property {
  text: string;
} 