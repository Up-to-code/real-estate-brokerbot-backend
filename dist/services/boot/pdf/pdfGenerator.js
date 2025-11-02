"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = generatePDF;
const fetch = async (...args) => {
    const { default: fetch } = await Promise.resolve().then(() => __importStar(require('node-fetch')));
    return fetch(...args);
};
const config_1 = require("./config");
const utils_1 = require("./utils");
async function generatePDF(propertyData) {
    console.log('📄 Generating PDF...');
    const optimizedData = (0, utils_1.shouldOptimizePdf)(Buffer.alloc(0))
        ? (0, utils_1.addOptimizationHints)(propertyData)
        : propertyData;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config_1.TIMEOUT_MS);
    try {
        const response = await fetch(config_1.PDF_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(optimizedData),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`PDF generation failed: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const pdfBuffer = Buffer.from(arrayBuffer);
        if (pdfBuffer.length > config_1.MAX_PDF_SIZE) {
            throw new Error('Generated PDF exceeds WhatsApp size limit');
        }
        const sizeInfo = (0, utils_1.getPdfSizeInfo)(pdfBuffer);
        console.log(`✅ PDF generated successfully, size: ${sizeInfo}`);
        if (pdfBuffer.length > 5 * 1024 * 1024) {
            console.log('⚠️ PDF is large, upload may take longer than usual');
        }
        return pdfBuffer;
    }
    catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('PDF generation timed out');
        }
        if (error.message.includes('PDF generation failed')) {
            throw error;
        }
        throw new Error(`PDF generation error: ${error.message}`);
    }
}
