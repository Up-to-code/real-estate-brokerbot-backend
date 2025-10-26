"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePropertyPDF = generatePropertyPDF;
exports.uploadPDFAndGetUrl = uploadPDFAndGetUrl;
exports.createPropertyPdf = createPropertyPdf;
async function generatePropertyPDF(property, name) {
    console.log('📝 [generatePropertyPDF] Called with:', { property, name });
    return Buffer.from('');
}
async function uploadPDFAndGetUrl(pdfBuffer, property, name) {
    console.log('📤 [uploadPDFAndGetUrl] Called with:', { pdfBuffer, property, name });
    return '';
}
async function createPropertyPdf({ property, name, otherData }) {
    console.log("[PDF] Creating PDF for property:", {
        id: property?.id,
        title: property?.title,
        name,
        otherData
    });
    return `https://example.com/fake-pdf/${property?.id || 'unknown'}.pdf`;
}
