import { Property } from '@prisma/client';

/**
 * Handles the 'generate_property_pdf' event.
 * Returns a string message (PDF URL or error message).
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
  const { propertyId, otherData, propertyType, city, type } = eventDetails || {};
  let property: Property | null = null;

  // 1. Try to find the property by propertyId (id, city, or address)
  if (propertyId) {
    property = await prisma.property.findFirst({
      where: {
        OR: [
          { id: propertyId },
          { city: propertyId },
          { address: { contains: propertyId } }
        ]
      }
    });
  }
  // 2. Try to find by propertyType or type and city
  const searchType = propertyType || type;
  if (!property && searchType && city) {
    property = await prisma.property.findFirst({
      where: {
        type: searchType,
        city: city
      }
    });
  }
  // 3. Fallback: try to search by type or otherData
  if (!property && otherData) {
    property = await prisma.property.findFirst({
      where: {
        type: otherData
      }
    });
  }
  // 4. If still not found, try to get property name from history
  if (!property) {
    const propertyName = getPropertyNameFromHistory(historySummary);
    if (propertyName) {
      property = await prisma.property.findFirst({
        where: {
          OR: [
            { title: { contains: propertyName } },
            { city: propertyName },
            { address: { contains: propertyName } }
          ]
        }
      });
    }
  }
  // 5. If still not found, use similarity search (by type/city)
  if (!property && (searchType || city)) {
    const allProps = await prisma.property.findMany({
      where: {
        ...(searchType ? { type: searchType } : {}),
      }
    });
    let bestScore = 0;
    let bestProp: Property | null = null;
    for (const prop of allProps) {
      const score = getSimilarityScore(prop.city, city || '') * 0.7 + getSimilarityScore(prop.title, name || '') * 0.3;
      if (score > bestScore) {
        bestScore = score;
        bestProp = prop;
      }
    }
    if (bestScore >= 0.5 && bestProp) {
      property = bestProp;
    }
  }
  // 6. If property not found, return a message
  if (!property) {
    return "لم يتم العثور على العقار المطلوب لإنشاء ملف PDF.";
  }
  // 7. Return the PDF URL (or send via WhatsApp in your flow)
  return `تم إنشاء ملف PDF للعقار "${property.title}". يمكنك تحميله من هنا:  `; // TODO: Use propertyName and eventDetails to generate/send PDF
} 