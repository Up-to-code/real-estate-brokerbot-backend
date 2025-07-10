import { WhatsAppResponse, InteractiveButton } from './types';

/**
 * Formats phone number for WhatsApp
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  // Add country code if missing (assumes US)
  if (!cleaned.startsWith('1') && cleaned.length === 10) {
    return '1' + cleaned;
  }
  return cleaned;
}

/**
 * Validates phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Extracts message ID from WhatsApp response
 */
export function getMessageId(response: WhatsAppResponse): string {
  return response.messages?.[0]?.id || '';
}

/**
 * Checks if WhatsApp response was successful
 */
export function isSuccessful(response: WhatsAppResponse): boolean {
  return response.messages && response.messages.length > 0;
}

/**
 * Creates a button object
 */
export function createButton(id: string, title: string): InteractiveButton {
  return { id, title };
}

/**
 * Extracts filename from URL
 */
export function extractFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || 'file';
    return filename;
  } catch {
    return 'file';
  }
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

/**
 * Validates if file type is supported by WhatsApp
 */
export function isSupportedFileType(filename: string): boolean {
  const extension = getFileExtension(filename);
  const supportedTypes = [
    // Documents
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf',
    // Images
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp',
    // Audio
    'mp3', 'wav', 'aac', 'ogg', 'm4a', 'amr',
    // Video
    'mp4', 'avi', 'mov', 'wmv', 'flv', '3gp', 'mkv'
  ];
  return supportedTypes.includes(extension);
}

/**
 * Gets human-readable file size
 */
export function getFileTypeDescription(filename: string): string {
  const extension = getFileExtension(filename);
  const descriptions: Record<string, string> = {
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