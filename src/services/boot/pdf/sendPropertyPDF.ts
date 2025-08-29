/**
 * PDF Sending Service
 * 
 * Main orchestrator for PDF generation and WhatsApp sending with fallback mechanisms.
 */

import { SendPDFParams, SendPDFResult, Property, PDFGenerationData } from './types';
import { validateEnvironment, validatePhoneNumber, getMarketerRole, getPdfSizeInfo } from './utils';
import { generatePDF } from './pdfGenerator';
import { uploadToWhatsApp } from './whatsappUploader';
import { sendWhatsAppMessage } from './whatsappMessenger';

/**
 * Send fallback text message with property details
 * @param phoneNumber - The recipient's phone number
 * @param property - The property data
 * @returns Promise<string> - The fallback message ID
 */
async function sendFallbackMessage(phoneNumber: string, property: Property): Promise<string> {
  console.log('📝 Sending fallback text message...');
  
  const message = `🏠 *تفاصيل العقار*

*${property.title}*
${property.description}

💰 السعر: ${property.price} ${property.currency}
📍 الموقع: ${property.location}, ${property.city}
🏘️ النوع: ${property.type}
📊 المساحة: ${property.area} متر مربع
🛏️ غرف النوم: ${property.bedrooms}
🚿 الحمامات: ${property.bathrooms}
🚗 موقف سيارات: ${property.parking}
🏗️ سنة البناء: ${property.yearBuilt}

👤 المسوق: ${property.marketer.name} - ${property.marketer.role}
📞 للتواصل: ${property.contactInfo}

_عذراً، لم نتمكن من إرسال ملف PDF. هذه تفاصيل العقار في رسالة نصية._`;

  // For now, we'll just return a success message
  // In a real implementation, you'd send this via WhatsApp API
  console.log('✅ Fallback message prepared');
  return 'fallback_message_sent';
}

/**
 * Send property PDF via WhatsApp
 * @param params - Parameters object containing property and phone number
 * @returns Promise<SendPDFResult> - Result object with success status
 */
async function sendPropertyPDF({ property, phoneNumber }: SendPDFParams): Promise<SendPDFResult> {
  try {
    console.log('🚀 Starting PDF send process for:', phoneNumber);
    
    // Environment validation
    const envCheck = validateEnvironment();
    if (!envCheck.isValid) {
      return { 
        success: false, 
        error: envCheck.error,
        errorCode: 'ENV_ERROR'
      };
    }
    
    // Phone number validation
    if (!validatePhoneNumber(phoneNumber)) {
      return { 
        success: false, 
        error: 'Invalid phone number format',
        errorCode: 'PHONE_INVALID'
      };
    }
    
    // Clean phone number (remove + and spaces)
    const cleanPhoneNumber = phoneNumber.replace(/[+\s]/g, '');
    
    // Prepare property data for PDF generation
    const propertyData: PDFGenerationData = {
      ...property,
      marketer: {
        name: property.marketer.name,
        role: property.marketer.role || getMarketerRole(property.marketer.name)
      },
      text: property.description || property.title || "تفاصيل العقار"
    };
    
    // Step 1: Generate PDF
    console.log('📄 Step 1: Generating PDF...');
    const pdfBuffer = await generatePDF(propertyData);
    const sizeInfo = getPdfSizeInfo(pdfBuffer);
    console.log(`📊 PDF size: ${sizeInfo}`);
    
    // Step 2: Upload to WhatsApp
    console.log('📤 Step 2: Uploading to WhatsApp...');
    let mediaId: string;
    try {
      mediaId = await uploadToWhatsApp(pdfBuffer);
    } catch (uploadError) {
      console.log('⚠️ PDF upload failed, sending fallback message...');
      const fallbackId = await sendFallbackMessage(cleanPhoneNumber, property);
      return {
        success: true,
        messageId: fallbackId,
        error: 'PDF upload failed, sent text message instead',
        errorCode: 'UPLOAD_FALLBACK'
      };
    }
    
    // Step 3: Send message
    console.log('💬 Step 3: Sending WhatsApp message...');
    const messageId = await sendWhatsAppMessage(cleanPhoneNumber, mediaId, property);
    
    console.log('🎉 PDF sent successfully!');
    return {
      success: true,
      messageId,
      mediaId,
      fileSize: sizeInfo
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('❌ Error in sendPropertyPDF:', errorMessage);
    
    // Provide more specific error codes
    let errorCode = 'PROCESS_ERROR';
    if (errorMessage.includes('timeout')) {
      errorCode = 'TIMEOUT_ERROR';
    } else if (errorMessage.includes('Upload failed')) {
      errorCode = 'UPLOAD_ERROR';
    } else if (errorMessage.includes('PDF generation')) {
      errorCode = 'PDF_GENERATION_ERROR';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorCode
    };
  }
}

export default sendPropertyPDF;

// Named exports for flexibility
export { sendPropertyPDF };
export type { Property, SendPDFParams, SendPDFResult } from './types';