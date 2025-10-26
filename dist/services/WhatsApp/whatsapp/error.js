"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppAPIError = void 0;
class WhatsAppAPIError extends Error {
    code;
    type;
    fbtrace_id;
    constructor(message, code, type, fbtrace_id) {
        super(message);
        this.code = code;
        this.type = type;
        this.fbtrace_id = fbtrace_id;
        this.name = 'WhatsAppAPIError';
    }
}
exports.WhatsAppAPIError = WhatsAppAPIError;
