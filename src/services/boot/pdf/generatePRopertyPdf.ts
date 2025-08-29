/**
 * Property PDF Generator Service
 * 
 * Handles property PDF generation requests with validation and data preparation.
 */

import { prisma } from '../../../lib/prisma';
import { EventDetails } from '../ai';
import sendPropertyPDF from './sendPropertyPDF';

/**
 * Request structure for PDF generation
 */
interface GeneratePdfRequest {
  type: "event";
  name: string;
  details: EventDetails;
}

/**
 * Enhanced gender detection for Arabic names
 * @param name - The marketer's name
 * @returns The appropriate role based on gender
 */
function getMarketerRole(name: string): string {
  const femaleNames = [
    // Common Arabic female names
    "سارة", "فاطمة", "عائشة", "مريم", "نورة", "هند", "جواهر", "منيرة", 
    "خديجة", "زينب", "رقية", "أمل", "نوال", "رنا", "لمى", "غادة", "ريم",
    "ندى", "سلمى", "نجلاء", "إيمان", "هيفاء", "ملاك", "شيماء", "نادية",
    "سمية", "حنان", "وفاء", "سعاد", "نهال", "رانيا", "دينا", "هالة"
  ];
  
  if (!name?.trim()) return "وسيط عقاري";
  
  const normalizedName = name.trim();
  return femaleNames.some(fname => normalizedName.includes(fname)) 
    ? "مسوقة عقارية" 
    : "وسيط عقاري";
}

/**
 * Validate PDF generation request
 * @param request - The request to validate
 * @returns Validation result
 */
function validateRequest(request: GeneratePdfRequest): { isValid: boolean; error?: string } {
  if (!request.details?.propertyId) {
    return { isValid: false, error: 'Property ID is required' };
  }
  
  if (!request.details?.phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  return { isValid: true };
}

/**
 * Generate and send property PDF
 * @param request - The PDF generation request
 * @returns Promise with success status and message
 */
const generatePropertyPdf = async (request: GeneratePdfRequest) => {
  try {
    console.log('[PDF] Generating property PDF with request:', {
      type: request.type,
      name: request.name,
      detailsName: request.details?.name,
      propertyId: request.details?.propertyId,
      phone: request.details?.phone
    });

    // Validate request
    const validation = validateRequest(request);
    if (!validation.isValid) {
      console.error('[PDF] Validation failed:', validation.error);
      return { success: false, message: validation.error };
    }

    // Find the property with error handling
    const property = await prisma.property.findUnique({
      where: { id: request.details.propertyId },
    });

    if (!property) {
      console.error('[PDF] Property not found for ID:', request.details.propertyId);
      return { success: false, message: 'Property not found' };
    }

    console.log('[PDF] Property found:', property.id);

    // Get the marketer name from the correct source
    const marketerName = request.details.name || request.name || "غير محدد";
    console.log('[PDF] Using marketer name:', marketerName);

    // Prepare property data with defaults
    const propertyData = {
      ...property,
      bedrooms: property.bedrooms ?? 0,
      bathrooms: property.bathrooms ?? 0,
      area: property.area ?? 0,
      yearBuilt: property.yearBuilt ?? 0,
      parking: property.parking ?? 0,
      contactInfo: request.details.phone ?? "",
      marketer: {
        name: marketerName,
        role: getMarketerRole(marketerName)
      },
    };

    console.log('[PDF] Prepared property data with marketer:', {
      name: propertyData.marketer.name,
      role: propertyData.marketer.role
    });

    // Send PDF with actual phone number from request
    const result = await sendPropertyPDF({
      property: propertyData,
      phoneNumber: request.details.phone ?? "",
    });

    if (result.success) {
      console.log('[PDF] ✅ PDF generated and sent successfully');
      return { success: true, message: 'PDF sent successfully' };
    } else {
      console.error('[PDF] ❌ Error sending PDF:', result.error);
      return { success: false, message: result.error || 'Failed to send PDF' };
    }

  } catch (error: any) {
    console.error('[PDF] Unexpected error:', error);
    return { 
      success: false, 
      message: error?.message || 'An unexpected error occurred'
    };
  }
};

export default generatePropertyPdf;