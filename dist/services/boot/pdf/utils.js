"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarketerRole = getMarketerRole;
exports.validatePhoneNumber = validatePhoneNumber;
exports.validateEnvironment = validateEnvironment;
exports.isPdfSizeOptimal = isPdfSizeOptimal;
exports.getPdfSizeInfo = getPdfSizeInfo;
exports.shouldOptimizePdf = shouldOptimizePdf;
exports.addOptimizationHints = addOptimizationHints;
const config_1 = require("./config");
function getMarketerRole(name) {
    const femaleNames = [
        "سارة", "فاطمة", "عائشة", "مريم", "نورة", "هند", "جواهر", "منيرة",
        "خديجة", "زينب", "رقية", "أمل", "نوال", "رنا", "لمى", "غادة", "ريم",
        "ندى", "سلمى", "نجلاء", "إيمان", "هيفاء", "ملاك", "شيماء", "نادية",
        "سمية", "حنان", "وفاء", "سعاد", "نهال", "رانيا", "دينا", "هالة"
    ];
    if (!name?.trim())
        return "وسيط عقاري";
    const normalizedName = name.trim().toLowerCase();
    return femaleNames.some(fname => normalizedName.includes(fname.toLowerCase()))
        ? "مسوقة عقارية"
        : "وسيط عقاري";
}
function validatePhoneNumber(phoneNumber) {
    if (!phoneNumber)
        return false;
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    return cleanNumber.length >= 10 && cleanNumber.length <= 15;
}
function validateEnvironment() {
    if (!config_1.PHONE_NUMBER_ID) {
        return {
            isValid: false,
            error: 'WHATSAPP_PHONE_NUMBER_ID environment variable is required'
        };
    }
    if (!config_1.WHATSAPP_TOKEN) {
        return {
            isValid: false,
            error: 'WHATSAPP_ACCESS_TOKEN environment variable is required'
        };
    }
    return { isValid: true };
}
function isPdfSizeOptimal(pdfBuffer) {
    const sizeInMB = pdfBuffer.length / 1024 / 1024;
    return sizeInMB <= 16;
}
function getPdfSizeInfo(pdfBuffer) {
    const sizeInBytes = pdfBuffer.length;
    const sizeInKB = sizeInBytes / 1024;
    const sizeInMB = sizeInKB / 1024;
    if (sizeInMB >= 1) {
        return `${sizeInMB.toFixed(2)}MB`;
    }
    else {
        return `${sizeInKB.toFixed(2)}KB`;
    }
}
function shouldOptimizePdf(pdfBuffer) {
    const sizeInMB = pdfBuffer.length / 1024 / 1024;
    return sizeInMB > 5;
}
function addOptimizationHints(propertyData) {
    return {
        ...propertyData,
        optimization: {
            compressImages: true,
            reduceQuality: true,
            removeMetadata: true,
            targetSize: '5MB'
        }
    };
}
