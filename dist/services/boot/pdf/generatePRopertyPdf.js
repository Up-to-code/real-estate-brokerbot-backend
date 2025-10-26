"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../../lib/prisma");
const sendPropertyPDF_1 = __importDefault(require("./sendPropertyPDF"));
function getMarketerRole(name) {
    const femaleNames = [
        "سارة", "فاطمة", "عائشة", "مريم", "نورة", "هند", "جواهر", "منيرة",
        "خديجة", "زينب", "رقية", "أمل", "نوال", "رنا", "لمى", "غادة", "ريم",
        "ندى", "سلمى", "نجلاء", "إيمان", "هيفاء", "ملاك", "شيماء", "نادية",
        "سمية", "حنان", "وفاء", "سعاد", "نهال", "رانيا", "دينا", "هالة"
    ];
    if (!name?.trim())
        return "وسيط عقاري";
    const normalizedName = name.trim();
    return femaleNames.some(fname => normalizedName.includes(fname))
        ? "مسوقة عقارية"
        : "وسيط عقاري";
}
function validateRequest(request) {
    if (!request.details?.propertyId) {
        return { isValid: false, error: 'Property ID is required' };
    }
    if (!request.details?.phone) {
        return { isValid: false, error: 'Phone number is required' };
    }
    return { isValid: true };
}
const generatePropertyPdf = async (request) => {
    try {
        console.log('[PDF] Generating property PDF with request:', {
            type: request.type,
            name: request.name,
            detailsName: request.details?.name,
            propertyId: request.details?.propertyId,
            phone: request.details?.phone
        });
        const validation = validateRequest(request);
        if (!validation.isValid) {
            console.error('[PDF] Validation failed:', validation.error);
            return { success: false, message: validation.error };
        }
        const property = await prisma_1.prisma.property.findUnique({
            where: { id: request.details.propertyId },
        });
        if (!property) {
            console.error('[PDF] Property not found for ID:', request.details.propertyId);
            return { success: false, message: 'Property not found' };
        }
        console.log('[PDF] Property found:', property.id);
        const marketerName = request.details.name || request.name || "غير محدد";
        console.log('[PDF] Using marketer name:', marketerName);
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
        const result = await (0, sendPropertyPDF_1.default)({
            property: propertyData,
            phoneNumber: request.details.phone ?? "",
        });
        if (result.success) {
            console.log('[PDF] ✅ PDF generated and sent successfully');
            return { success: true, message: 'PDF sent successfully' };
        }
        else {
            console.error('[PDF] ❌ Error sending PDF:', result.error);
            return { success: false, message: result.error || 'Failed to send PDF' };
        }
    }
    catch (error) {
        console.error('[PDF] Unexpected error:', error);
        return {
            success: false,
            message: error?.message || 'An unexpected error occurred'
        };
    }
};
exports.default = generatePropertyPdf;
