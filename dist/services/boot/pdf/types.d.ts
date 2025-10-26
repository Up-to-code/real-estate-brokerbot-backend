export interface Property {
    id?: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    type: string;
    status: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    location: string;
    city: string;
    country: string;
    images: string[];
    features: string[];
    yearBuilt: number;
    parking: number;
    contactInfo: string;
    marketer: {
        name: string;
        role: string;
    };
}
export interface SendPDFParams {
    property: Property;
    phoneNumber: string;
}
export interface SendPDFResult {
    success: boolean;
    messageId?: string;
    mediaId?: string;
    fileSize?: string;
    error?: string;
    errorCode?: string;
}
export interface WhatsAppMessageResponse {
    messages?: Array<{
        id: string;
        message_status: string;
    }>;
    error?: {
        message: string;
        type: string;
        code: number;
    };
}
export interface PDFGenerationData extends Property {
    text: string;
}
