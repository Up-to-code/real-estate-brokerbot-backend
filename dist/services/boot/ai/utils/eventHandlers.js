"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGeneratePropertyPdfEvent = handleGeneratePropertyPdfEvent;
const pdfUtils_1 = require("../../services/pdfUtils");
function isValidUUID(id) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}
function extractLastPropertyIdFromHistory(historySummary) {
    const match = historySummary.match(/"propertyId"\s*:\s*"([^"]+)"/g);
    if (match && match.length > 0) {
        const last = match[match.length - 1];
        const idMatch = last.match(/"propertyId"\s*:\s*"([^"]+)"/);
        if (idMatch)
            return idMatch[1];
    }
    return undefined;
}
async function handleGeneratePropertyPdfEvent({ eventDetails, historySummary, name, prisma, getPropertyNameFromHistory, getSimilarityScore }) {
    let { propertyId, otherData, propertyType, city, type } = eventDetails || {};
    let property = null;
    if (propertyId && isValidUUID(propertyId)) {
        property = await prisma.property.findUnique({ where: { id: propertyId } });
    }
    if (!property) {
        const lastPropertyId = extractLastPropertyIdFromHistory(historySummary);
        if (lastPropertyId && isValidUUID(lastPropertyId)) {
            property = await prisma.property.findUnique({ where: { id: lastPropertyId } });
        }
    }
    if (!property && city) {
        property = await prisma.property.findFirst({ where: { city } });
    }
    if (!property) {
        return "لم يتم العثور على العقار المطلوب لإنشاء ملف PDF. يرجى تحديد العقار بدقة.";
    }
    console.log("[PDF] Property found for PDF:", property);
    console.log("[DEBUG] About to call createPropertyPdf", { id: property.id, title: property.title, name, otherData });
    const pdfUrl = await (0, pdfUtils_1.createPropertyPdf)({ property, name, otherData });
    return `تم إنشاء ملف PDF للعقار "${property.title}" (ID: ${property.id}). يمكنك تحميله من هنا: ${pdfUrl}`;
}
