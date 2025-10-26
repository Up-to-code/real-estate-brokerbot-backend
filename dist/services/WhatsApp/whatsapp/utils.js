"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPhoneNumber = formatPhoneNumber;
exports.isValidPhoneNumber = isValidPhoneNumber;
exports.getMessageId = getMessageId;
exports.isSuccessful = isSuccessful;
exports.createButton = createButton;
exports.extractFilenameFromUrl = extractFilenameFromUrl;
exports.getFileExtension = getFileExtension;
exports.isSupportedFileType = isSupportedFileType;
exports.getFileTypeDescription = getFileTypeDescription;
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (!cleaned.startsWith('1') && cleaned.length === 10) {
        return '1' + cleaned;
    }
    return cleaned;
}
function isValidPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
}
function getMessageId(response) {
    return response.messages?.[0]?.id || '';
}
function isSuccessful(response) {
    return response.messages && response.messages.length > 0;
}
function createButton(id, title) {
    return { id, title };
}
function extractFilenameFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = pathname.split('/').pop() || 'file';
        return filename;
    }
    catch {
        return 'file';
    }
}
function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}
function isSupportedFileType(filename) {
    const extension = getFileExtension(filename);
    const supportedTypes = [
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf',
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp',
        'mp3', 'wav', 'aac', 'ogg', 'm4a', 'amr',
        'mp4', 'avi', 'mov', 'wmv', 'flv', '3gp', 'mkv'
    ];
    return supportedTypes.includes(extension);
}
function getFileTypeDescription(filename) {
    const extension = getFileExtension(filename);
    const descriptions = {
        'pdf': 'PDF Document',
        'doc': 'Word Document',
        'docx': 'Word Document',
        'xls': 'Excel Spreadsheet',
        'xlsx': 'Excel Spreadsheet',
        'ppt': 'PowerPoint Presentation',
        'pptx': 'PowerPoint Presentation',
        'txt': 'Text File',
        'rtf': 'Rich Text Document',
        'jpg': 'JPEG Image',
        'jpeg': 'JPEG Image',
        'png': 'PNG Image',
        'gif': 'GIF Image',
        'mp3': 'MP3 Audio',
        'wav': 'WAV Audio',
        'mp4': 'MP4 Video',
        'avi': 'AVI Video'
    };
    return descriptions[extension] || 'File';
}
