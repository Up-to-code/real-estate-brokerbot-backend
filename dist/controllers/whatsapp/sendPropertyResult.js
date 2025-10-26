"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPropertyResult = sendPropertyResult;
const whatsapp_1 = require("../../services/WhatsApp/whatsapp");
async function sendPropertyResult(response, recipient) {
    if (response.properties.length === 0) {
        await (0, whatsapp_1.sendText)(whatsapp_1.DEFAULT_CONFIG, recipient, response.message ||
            "لم يتم العثور على عقارات مطابقة لبحثك. إذا كنت بحاجة للمساعدة أو ترغب في التواصل مع فريقنا، يرجى الرد بكلمة 'تواصل' أو الاتصال بنا مباشرة وسنساعدك في العثور على العقار المناسب لك.");
    }
    else {
        for (const property of response.properties) {
            if (property.images && property.images.length > 0) {
                await (0, whatsapp_1.sendImagesGroup)(whatsapp_1.DEFAULT_CONFIG, recipient, property.images);
            }
            const propertyText = `🏷 معرف العقار: ${property.id || 'غير متوفر'}\n` +
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
            await (0, whatsapp_1.sendText)(whatsapp_1.DEFAULT_CONFIG, recipient, propertyText);
        }
    }
}
