"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = generatePDF;
const node_fetch_1 = __importDefault(require("node-fetch"));
const config_1 = require("./config");
const utils_1 = require("./utils");
async function generatePDF(propertyData) {
    console.log('📄 Generating PDF...');
    const optimizedData = (0, utils_1.shouldOptimizePdf)(Buffer.alloc(0)) ?
        (0, utils_1.addOptimizationHints)(propertyData) : propertyData;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config_1.TIMEOUT_MS);
    try {
        const response = await (0, node_fetch_1.default)(config_1.PDF_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(optimizedData),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`PDF generation failed: ${response.status} ${response.statusText}`);
        }
        const pdfBuffer = Buffer.from(await response.arrayBuffer());
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
