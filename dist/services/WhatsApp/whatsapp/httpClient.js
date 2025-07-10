"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeApiRequest = makeApiRequest;
const error_1 = require("./error");
async function makeApiRequest(config, endpoint, payload) {
    const defaultConfig = {
        apiVersion: 'v22.0',
        baseUrl: 'https://graph.facebook.com',
        timeout: 30000,
        ...config
    };
    const url = `${defaultConfig.baseUrl}/${defaultConfig.apiVersion}/${defaultConfig.phoneNumberId}/${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), defaultConfig.timeout);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${defaultConfig.accessToken}`,
                'User-Agent': 'WhatsApp-Client/1.0.0'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        const data = await response.json();
        if (data.error) {
            const error = data;
            throw new error_1.WhatsAppAPIError(error.error.message, error.error.code, error.error.type, error.error.fbtrace_id);
        }
        return data;
    }
    catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof error_1.WhatsAppAPIError) {
            throw error;
        }
        throw new error_1.WhatsAppAPIError(error instanceof Error ? error.message : 'Network error occurred', 500, 'NETWORK_ERROR');
    }
}
