"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLanguage = exports.isValidMessage = void 0;
const isValidMessage = (message) => {
    return typeof message === 'string' && message.trim().length > 0;
};
exports.isValidMessage = isValidMessage;
const detectLanguage = (message) => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(message) ? 'ar' : 'en';
};
exports.detectLanguage = detectLanguage;
