interface Property {
    id?: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    city: string;
    country: string;
    bedrooms?: number | null;
    bathrooms?: number | null;
    area?: number | null;
    type: string;
    status: string;
    address?: string;
    furnished?: boolean;
    petFriendly?: boolean;
    parking?: string | number | null;
    yearBuilt?: number | null;
    features?: string[];
    amenities?: string[];
    contactInfo?: string;
    images?: string[];
}
interface PropertyResponse {
    properties: Property[];
    message?: string;
}
export declare function sendPropertyResult(response: PropertyResponse, recipient: string): Promise<void>;
export {};
