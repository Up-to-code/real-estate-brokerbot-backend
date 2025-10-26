"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPropertyPDF = sendPropertyPDF;
const utils_1 = require("./utils");
const pdfGenerator_1 = require("./pdfGenerator");
const whatsappUploader_1 = require("./whatsappUploader");
const whatsappMessenger_1 = require("./whatsappMessenger");
async function sendFallbackMessage(phoneNumber, property) {
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
    console.log('✅ Fallback message prepared');
    return 'fallback_message_sent';
}
async function sendPropertyPDF({ property, phoneNumber }) {
    try {
        console.log('🚀 Starting PDF send process for:', phoneNumber);
        const envCheck = (0, utils_1.validateEnvironment)();
        if (!envCheck.isValid) {
            return {
                success: false,
                error: envCheck.error,
                errorCode: 'ENV_ERROR'
            };
        }
        if (!(0, utils_1.validatePhoneNumber)(phoneNumber)) {
            return {
                success: false,
                error: 'Invalid phone number format',
                errorCode: 'PHONE_INVALID'
            };
        }
        const cleanPhoneNumber = phoneNumber.replace(/[+\s]/g, '');
        const propertyData = {
            ...property,
            marketer: {
                name: property.marketer.name,
                role: property.marketer.role || (0, utils_1.getMarketerRole)(property.marketer.name)
            },
            text: property.description || property.title || "تفاصيل العقار"
        };
        console.log('📄 Step 1: Generating PDF...');
        const pdfBuffer = await (0, pdfGenerator_1.generatePDF)(propertyData);
        const sizeInfo = (0, utils_1.getPdfSizeInfo)(pdfBuffer);
        console.log(`📊 PDF size: ${sizeInfo}`);
        console.log('📤 Step 2: Uploading to WhatsApp...');
        let mediaId;
        try {
            mediaId = await (0, whatsappUploader_1.uploadToWhatsApp)(pdfBuffer);
        }
        catch (uploadError) {
            console.log('⚠️ PDF upload failed, sending fallback message...');
            const fallbackId = await sendFallbackMessage(cleanPhoneNumber, property);
            return {
                success: true,
                messageId: fallbackId,
                error: 'PDF upload failed, sent text message instead',
                errorCode: 'UPLOAD_FALLBACK'
            };
        }
        console.log('💬 Step 3: Sending WhatsApp message...');
        const messageId = await (0, whatsappMessenger_1.sendWhatsAppMessage)(cleanPhoneNumber, mediaId, property);
        console.log('🎉 PDF sent successfully!');
        return {
            success: true,
            messageId,
            mediaId,
            fileSize: sizeInfo
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('❌ Error in sendPropertyPDF:', errorMessage);
        let errorCode = 'PROCESS_ERROR';
        if (errorMessage.includes('timeout')) {
            errorCode = 'TIMEOUT_ERROR';
        }
        else if (errorMessage.includes('Upload failed')) {
            errorCode = 'UPLOAD_ERROR';
        }
        else if (errorMessage.includes('PDF generation')) {
            errorCode = 'PDF_GENERATION_ERROR';
        }
        return {
            success: false,
            error: errorMessage,
            errorCode
        };
    }
}
exports.default = sendPropertyPDF;
