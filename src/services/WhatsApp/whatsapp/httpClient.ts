import { WhatsAppConfig, WhatsAppResponse, WhatsAppError } from './types';
import { WhatsAppAPIError } from './error';

/**
 * Makes HTTP POST request to WhatsApp API
 * Handles timeout and error scenarios
 */
export async function makeApiRequest(
  config: WhatsAppConfig,
  endpoint: string,
  payload: any
): Promise<WhatsAppResponse> {
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

    // Handle API errors
    if (data.error) {
      const error = data as WhatsAppError;
      throw new WhatsAppAPIError(
        error.error.message,
        error.error.code,
        error.error.type,
        error.error.fbtrace_id
      );
    }

    return data as WhatsAppResponse;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof WhatsAppAPIError) {
      throw error;
    }
    
    throw new WhatsAppAPIError(
      error instanceof Error ? error.message : 'Network error occurred',
      500,
      'NETWORK_ERROR'
    );
  }
} 