import { DEFAULT_CONFIG, sendText, sendImagesGroup } from "../../services/WhatsApp/whatsapp";

interface Property {
  id?: string; // Ensure id is present
  title: string;
  description: string;
  price: number;
  currency: string;
  city: string;
  country: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  type: string;
  status: string;
  address?: string;
  furnished?: boolean;
  petFriendly?: boolean;
  parking?: string | number | null;
  yearBuilt?: number | null;
  features?: string[];
  amenities?: string[];
  contactInfo?: string;
  images?: string[];
}

interface PropertyResponse {
  properties: Property[];
  message?: string;
}

export async function sendPropertyResult(response: PropertyResponse, recipient: string) {
  if (response.properties.length === 0) {
    await sendText(
      DEFAULT_CONFIG,
      recipient,
      response.message ||
        "لم يتم العثور على عقارات مطابقة لبحثك. إذا كنت بحاجة للمساعدة أو ترغب في التواصل مع فريقنا، يرجى الرد بكلمة 'تواصل' أو الاتصال بنا مباشرة وسنساعدك في العثور على العقار المناسب لك."
    );
  } else {
    for (const property of response.properties) {
      // Send images first (without caption)
      if (property.images && property.images.length > 0) {
        await sendImagesGroup(DEFAULT_CONFIG, recipient, property.images);
      }
      // Then send property details as rich text (Arabic)
      const propertyText =
        `🏷 معرف العقار: ${property.id || 'غير متوفر'}\n` +
        `🏠 العنوان: ${property.title}\n` +
        `${property.description}\n` +
        `💰 السعر: ${property.price} ${property.currency}\n` +
        `📍 الموقع: ${property.city}, ${property.country}\n` +
        (property.bedrooms ? `🛏 عدد الغرف: ${property.bedrooms} | ` : "") +
        (property.bathrooms ? `🛁 عدد الحمامات: ${property.bathrooms} | ` : "") +
        (property.area ? `📐 المساحة: ${property.area} متر مربع\n` : "\n") +
        `🏷 النوع: ${property.type} | الحالة: ${property.status}\n` +
        (property.address ? `🏢 العنوان التفصيلي: ${property.address}\n` : "") +
        (property.furnished ? `🛋 مفروش | ` : "") +
        (property.petFriendly ? `🐾 مناسب للحيوانات الأليفة | ` : "") +
        (property.parking ? `🚗 مواقف: ${property.parking} | ` : "") +
        (property.yearBuilt ? `🏗 سنة البناء: ${property.yearBuilt}\n` : "\n") +
        (property.features && property.features.length > 0 ? `⭐ الميزات: ${property.features.join(', ')}\n` : "") +
        (property.amenities && property.amenities.length > 0 ? `🌟 المرافق: ${property.amenities.join(', ')}\n` : "") +
        (property.contactInfo ? `📞 للتواصل: ${property.contactInfo}` : "");
      await sendText(DEFAULT_CONFIG, recipient, propertyText);
    }
  }
} 