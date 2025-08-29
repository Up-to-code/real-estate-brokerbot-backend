/**
 * PDF Service Utilities
 * 
 * Utility functions for PDF generation, validation, and optimization.
 */

import { PHONE_NUMBER_ID, WHATSAPP_TOKEN } from './config';

/**
 * Enhanced gender detection for Arabic names
 * @param name - The marketer's name
 * @returns The appropriate role based on gender
 */
export function getMarketerRole(name: string): string {
  const femaleNames = [
    "سارة", "فاطمة", "عائشة", "مريم", "نورة", "هند", "جواهر", "منيرة", 
    "خديجة", "زينب", "رقية", "أمل", "نوال", "رنا", "لمى", "غادة", "ريم",
    "ندى", "سلمى", "نجلاء", "إيمان", "هيفاء", "ملاك", "شيماء", "نادية",
    "سمية", "حنان", "وفاء", "سعاد", "نهال", "رانيا", "دينا", "هالة"
  ];
  
  if (!name?.trim()) return "وسيط عقاري";
  
  const normalizedName = name.trim().toLowerCase();
  return femaleNames.some(fname => normalizedName.includes(fname.toLowerCase())) 
    ? "مسوقة عقارية" 
    : "وسيط عقاري";
}

/**
 * Phone number validation
 * @param phoneNumber - The phone number to validate
 * @returns Whether the phone number is valid
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  if (!phoneNumber) return false;
  
  // Remove all non-digits
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  // Check if it's a valid length (typically 10-15 digits)
  return cleanNumber.length >= 10 && cleanNumber.length <= 15;
}

/**
 * Environment validation
 * @returns Validation result with error message if invalid
 */
export function validateEnvironment(): { isValid: boolean; error?: string } {
  if (!PHONE_NUMBER_ID) {
    return { 
      isValid: false, 
      error: 'WHATSAPP_PHONE_NUMBER_ID environment variable is required' 
    };
  }
  
  if (!WHATSAPP_TOKEN) {
    return { 
      isValid: false, 
      error: 'WHATSAPP_ACCESS_TOKEN environment variable is required' 
    };
  }
  
  return { isValid: true };
}

/**
 * PDF Size Utilities
 */

/**
 * Check if PDF size is optimal for WhatsApp upload
 * WhatsApp recommends keeping files under 16MB for better reliability
 * @param pdfBuffer - The PDF buffer to check
 * @returns Whether the size is optimal
 */
export function isPdfSizeOptimal(pdfBuffer: Buffer): boolean {
  const sizeInMB = pdfBuffer.length / 1024 / 1024;
  return sizeInMB <= 16;
}

/**
 * Get PDF size in human readable format
 * @param pdfBuffer - The PDF buffer to measure
 * @returns Formatted size string (e.g., "2.5MB" or "512KB")
 */
export function getPdfSizeInfo(pdfBuffer: Buffer): string {
  const sizeInBytes = pdfBuffer.length;
  const sizeInKB = sizeInBytes / 1024;
  const sizeInMB = sizeInKB / 1024;
  
  if (sizeInMB >= 1) {
    return `${sizeInMB.toFixed(2)}MB`;
  } else {
    return `${sizeInKB.toFixed(2)}KB`;
  }
}

/**
 * Check if PDF should be optimized based on size
 * @param pdfBuffer - The PDF buffer to check
 * @returns Whether optimization is recommended
 */
export function shouldOptimizePdf(pdfBuffer: Buffer): boolean {
  const sizeInMB = pdfBuffer.length / 1024 / 1024;
  return sizeInMB > 5; // Optimize if larger than 5MB
}

/**
 * Add optimization hints to PDF generation request
 * @param propertyData - The property data to enhance
 * @returns Enhanced property data with optimization hints
 */
export function addOptimizationHints(propertyData: any): any {
  return {
    ...propertyData,
    optimization: {
      compressImages: true,
      reduceQuality: true,
      removeMetadata: true,
      targetSize: '5MB' // Target size for optimization
    }
  };
} 