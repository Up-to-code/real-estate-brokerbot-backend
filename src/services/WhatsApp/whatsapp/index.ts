// ===============================
// WhatsApp Service Usage Example
// ===============================
//
// Import any function like this:
// import { sendText, sendImage, sendButtons } from './whatsapp';
//
// Example usage:
//
// import { sendText } from './whatsapp';
//
// const config = {
//   accessToken: 'your_access_token',
//   phoneNumberId: 'your_phone_number_id'
// };
//
// sendText(config, '1234567890', 'Hello World!');
//
// For more, see each file for detailed function docs.
// ===============================

export * from './types';
export * from './error';
export * from './httpClient';
export * from './textMessaging';
export * from './mediaMessaging';
export { sendImagesGroup } from './mediaMessaging';
export * from './interactiveMessaging';
export * from './reactionsStatus';
export * from './locationContact';
export * from './utils'; 

export const DEFAULT_CONFIG = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
  phoneNumberId:  process.env.WHATSAPP_PHONE_NUMBER_ID!,
};
