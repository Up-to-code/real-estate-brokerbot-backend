import { Property } from '@prisma/client';
import { createPropertyPdf } from '../../services/pdfUtils';

function isValidUUID(id: string): boolean {
  // Simple UUID v4 regex
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Helper to extract last propertyId from history summary (if available)
 */
function extractLastPropertyIdFromHistory(historySummary: string): string | undefined {
  // Try to find a propertyId in the last 3 searches in the summary
  const match = historySummary.match(/"propertyId"\s*:\s*"([^"]+)"/g);
  if (match && match.length > 0) {
    // Get the last match
    const last = match[match.length - 1];
    const idMatch = last.match(/"propertyId"\s*:\s*"([^"]+)"/);
    if (idMatch) return idMatch[1];
  }
  return undefined;
}

/**
 * Handles the 'generate_property_pdf' event.
 * Returns a string message (PDF URL or error message).
 * Fallback order:
 *   1. Use propertyId from event if valid
 *   2. Use last propertyId from history if valid
 *   3. Use city search (legacy)
 */
export async function handleGeneratePropertyPdfEvent({
  eventDetails,
  historySummary,
  name,
  prisma,
  getPropertyNameFromHistory,
  getSimilarityScore
}: {
  eventDetails: any,
  historySummary: string,
  name?: string,
  prisma: any,
  getPropertyNameFromHistory: (historySummary: string) => string | undefined,
  getSimilarityScore: (a: string, b: string) => number
}): Promise<string> {
  let { propertyId, otherData, propertyType, city, type } = eventDetails || {};
  let property: Property | null = null;

  // 1. Try propertyId from event
  if (propertyId && isValidUUID(propertyId)) {
    property = await prisma.property.findUnique({ where: { id: propertyId } });
  }

  // 2. Fallback: last propertyId from history
  if (!property) {
    const lastPropertyId = extractLastPropertyIdFromHistory(historySummary);
    if (lastPropertyId && isValidUUID(lastPropertyId)) {
      property = await prisma.property.findUnique({ where: { id: lastPropertyId } });
    }
  }

  // 3. Fallback: search by city (legacy, not recommended)
  if (!property && city) {
    property = await prisma.property.findFirst({ where: { city } });
  }

  // 4. If still not found, return error
  if (!property) {
    return "لم يتم العثور على العقار المطلوب لإنشاء ملف PDF. يرجى تحديد العقار بدقة.";
  }
  console.log("[PDF] Property found for PDF:", property);

  // 5. Generate PDF and return URL
  console.log("[DEBUG] About to call createPropertyPdf", { id: property.id, title: property.title, name, otherData });
  const pdfUrl = await createPropertyPdf({ property, name, otherData });
  return `تم إنشاء ملف PDF للعقار "${property.title}" (ID: ${property.id}). يمكنك تحميله من هنا: ${pdfUrl}`;
} 