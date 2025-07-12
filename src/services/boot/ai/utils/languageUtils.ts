// Utility functions for language and message validation

export const isValidMessage = (message: string): boolean => {
  return typeof message === 'string' && message.trim().length > 0;
};

export const detectLanguage = (message: string): 'ar' | 'en' => {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(message) ? 'ar' : 'en';
}; 