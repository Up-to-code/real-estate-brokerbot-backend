/**
 * PDF Generator Service
 *
 * Handles PDF generation from property data via external API.
 */

// ✅ Dynamic import fix for node-fetch in CommonJS environments
const fetch = async (...args: Parameters<typeof import('node-fetch')['default']>) => {
  const { default: fetch } = await import('node-fetch');
  return fetch(...args);
};


import { PDFGenerationData } from './types';
import { PDF_API_URL, MAX_PDF_SIZE, TIMEOUT_MS } from './config';
import { shouldOptimizePdf, addOptimizationHints, getPdfSizeInfo } from './utils';

/**
 * Generate PDF from property data
 * @param propertyData - The property data to generate PDF from
 * @returns Promise<Buffer> - The generated PDF as a buffer
 * @throws Error if PDF generation fails or times out
 */
export async function generatePDF(propertyData: PDFGenerationData): Promise<Buffer> {
  console.log('📄 Generating PDF...');

  // Add optimization hints if needed
  const optimizedData = shouldOptimizePdf(Buffer.alloc(0))
    ? addOptimizationHints(propertyData)
    : propertyData;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(PDF_API_URL, {
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

    if (pdfBuffer.length > MAX_PDF_SIZE) {
      throw new Error('Generated PDF exceeds WhatsApp size limit');
    }

    const sizeInfo = getPdfSizeInfo(pdfBuffer);
    console.log(`✅ PDF generated successfully, size: ${sizeInfo}`);

    // Warn if PDF is large
    if (pdfBuffer.length > 5 * 1024 * 1024) {
      console.log('⚠️ PDF is large, upload may take longer than usual');
    }

    return pdfBuffer;
  } catch (error: any) {
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
