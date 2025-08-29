# PDF Service Module

A comprehensive PDF generation and WhatsApp sending service for real estate properties.

## Overview

This module provides a complete solution for generating property PDFs and sending them via WhatsApp Business API, with robust error handling, retry logic, and fallback mechanisms.

## Features

- ✅ **PDF Generation**: External API integration with optimization hints
- ✅ **WhatsApp Upload**: Retry logic with configurable timeouts
- ✅ **Fallback Mechanism**: Text message fallback when PDF upload fails
- ✅ **Name Preservation**: Proper handling of marketer names throughout the flow
- ✅ **Error Handling**: Comprehensive error codes and logging
- ✅ **Size Optimization**: Automatic PDF size warnings and optimization hints

## File Structure

```
src/services/boot/pdf/
├── index.ts              # Main exports
├── config.ts             # Configuration constants
├── types.ts              # TypeScript type definitions
├── utils.ts              # Utility functions
├── pdfGenerator.ts       # PDF generation service
├── whatsappUploader.ts   # WhatsApp upload service
├── whatsappMessenger.ts  # WhatsApp messaging service
├── sendPropertyPDF.ts    # Main orchestrator service
├── generatePRopertyPdf.ts # Property PDF generator
├── test-upload.ts        # Upload functionality tests
├── test-name-flow.ts     # Name flow tests
└── README.md             # This documentation
```

## Quick Start

```typescript
import { sendPropertyPDF } from './pdf';

const result = await sendPropertyPDF({
  property: propertyData,
  phoneNumber: '+966501234567'
});

if (result.success) {
  console.log('PDF sent successfully!');
  console.log('File size:', result.fileSize);
} else {
  console.log('Error:', result.error);
  console.log('Error code:', result.errorCode);
}
```

## Configuration

```typescript
// config.ts
export const UPLOAD_TIMEOUT_MS = 120000; // 2 minutes
export const MAX_RETRIES = 3;
export const RETRY_DELAY_MS = 2000;
export const MAX_PDF_SIZE = 100 * 1024 * 1024; // 100MB
```

## Error Codes

- `ENV_ERROR`: Environment variables missing
- `PHONE_INVALID`: Invalid phone number format
- `PDF_GENERATION_ERROR`: PDF generation failed
- `UPLOAD_ERROR`: WhatsApp upload failed
- `TIMEOUT_ERROR`: Operation timed out
- `UPLOAD_FALLBACK`: Upload failed, sent text message instead
- `PROCESS_ERROR`: General processing error

## Testing

Run the test scripts to verify functionality:

```bash
# Test upload improvements
npx ts-node src/services/boot/pdf/test-upload.ts

# Test name flow
npx ts-node src/services/boot/pdf/test-name-flow.ts
```

## API Reference

### Main Functions

#### `sendPropertyPDF(params: SendPDFParams): Promise<SendPDFResult>`
Main function to generate and send PDF via WhatsApp.

#### `generatePDF(propertyData: PDFGenerationData): Promise<Buffer>`
Generate PDF from property data.

#### `uploadToWhatsApp(pdfBuffer: Buffer): Promise<string>`
Upload PDF to WhatsApp with retry logic.

#### `sendWhatsAppMessage(phoneNumber: string, mediaId: string, property: Property): Promise<string>`
Send WhatsApp message with PDF attachment.

### Utility Functions

#### `getMarketerRole(name: string): string`
Determine marketer role based on Arabic name gender.

#### `validatePhoneNumber(phoneNumber: string): boolean`
Validate phone number format.

#### `validateEnvironment(): { isValid: boolean; error?: string }`
Validate required environment variables.

#### `getPdfSizeInfo(pdfBuffer: Buffer): string`
Get human-readable PDF size.

## Best Practices

1. **Monitor file sizes**: Keep PDFs under 5MB for optimal upload success
2. **Handle errors gracefully**: Always check the `success` flag and handle errors
3. **Use proper phone numbers**: Ensure phone numbers are in international format
4. **Test thoroughly**: Use the provided test scripts before deployment

## Troubleshooting

### Common Issues

1. **Timeout errors**: Increase `UPLOAD_TIMEOUT_MS` for large files
2. **Name showing as "غير محدد"**: Ensure name is passed in `request.details.name`
3. **Upload failures**: Check WhatsApp API credentials and rate limits
4. **PDF generation errors**: Verify PDF API endpoint is accessible

### Debugging

Enable detailed logging by checking console output for:
- 📄 PDF generation progress
- 📤 Upload attempt tracking
- 💬 Message sending status
- ⚠️ Warning messages for large files

## Contributing

When modifying this module:
1. Update tests to reflect changes
2. Maintain backward compatibility
3. Add proper JSDoc documentation
4. Follow the established error handling patterns 