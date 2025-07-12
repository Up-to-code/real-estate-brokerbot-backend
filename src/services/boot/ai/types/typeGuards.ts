/**
 * Type guard for event response with eventName and eventDetails
 */
export function isStructuredEventResponse(response: any): response is { type: 'event'; eventName: string; eventDetails: any; content?: string } {
  return response && response.type === 'event' && typeof response.eventName === 'string' && response.eventDetails !== undefined;
} 