"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToWhatsApp = uploadToWhatsApp;
const form_data_1 = __importDefault(require("form-data"));
const axios_1 = __importDefault(require("axios"));
const config_1 = require("./config");
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function uploadToWhatsApp(pdfBuffer) {
    console.log('📤 Uploading to WhatsApp...');
    console.log(`📊 File size: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)}MB`);
    let lastErrorMessage = undefined;
    for (let attempt = 1; attempt <= config_1.MAX_RETRIES; attempt++) {
        try {
            console.log(`🔄 Upload attempt ${attempt}/${config_1.MAX_RETRIES}`);
            const form = new form_data_1.default();
            form.append('messaging_product', 'whatsapp');
            form.append('file', pdfBuffer, {
                filename: `property_${Date.now()}.pdf`,
                contentType: 'application/pdf'
            });
            const uploadResponse = await axios_1.default.post(`https://graph.facebook.com/v18.0/${config_1.PHONE_NUMBER_ID}/media`, form, {
                headers: {
                    Authorization: `Bearer ${config_1.WHATSAPP_TOKEN}`,
                    ...form.getHeaders()
                },
                timeout: config_1.UPLOAD_TIMEOUT_MS,
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });
            const mediaId = uploadResponse.data.id;
            if (!mediaId) {
                throw new Error('No media ID returned from WhatsApp');
            }
            console.log('✅ PDF uploaded successfully, media ID:', mediaId);
            return mediaId;
        }
        catch (error) {
            let errorMsg;
            if (axios_1.default.isAxiosError(error)) {
                const status = error.response?.status;
                const message = error.response?.data?.error?.message || error.message;
                errorMsg = message;
                lastErrorMessage = message;
                if (status === 400 || status === 401 || status === 403) {
                    throw new Error(`Upload failed (${status}): ${message}`);
                }
                console.log(`⚠️ Upload attempt ${attempt} failed (${status}): ${message}`);
                if (attempt < config_1.MAX_RETRIES) {
                    console.log(`⏳ Waiting ${config_1.RETRY_DELAY_MS}ms before retry...`);
                    await sleep(config_1.RETRY_DELAY_MS);
                }
            }
            else {
                if (error instanceof Error && error.message) {
                    errorMsg = error.message;
                    lastErrorMessage = error.message;
                }
                else {
                    errorMsg = String(error);
                    lastErrorMessage = errorMsg;
                }
                console.log(`⚠️ Upload attempt ${attempt} failed: ${errorMsg}`);
                if (attempt < config_1.MAX_RETRIES) {
                    console.log(`⏳ Waiting ${config_1.RETRY_DELAY_MS}ms before retry...`);
                    await sleep(config_1.RETRY_DELAY_MS);
                }
            }
        }
    }
    const errorMessage = lastErrorMessage || 'Unknown upload error';
    throw new Error(`Upload failed after ${config_1.MAX_RETRIES} attempts: ${errorMessage}`);
}
