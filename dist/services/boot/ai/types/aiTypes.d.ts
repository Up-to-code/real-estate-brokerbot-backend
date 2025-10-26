export interface SearchQuery {
    title?: string;
    description?: string;
    city?: string;
    district?: string;
    type?: string;
    purpose?: string;
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
    minBathrooms?: number;
    maxBathrooms?: number;
    minArea?: number;
    maxArea?: number;
    furnished?: boolean | null;
    petFriendly?: boolean | null;
    parking?: boolean | null;
    elevator?: boolean | null;
    pool?: boolean | null;
    garden?: boolean | null;
    security?: boolean | null;
    yearBuilt?: number;
    address?: string;
    priceRange?: string;
}
export interface EventDetails {
    name?: string;
    propertyId?: string;
    phone?: string;
    email?: string;
    requestType?: 'pdf' | 'callback' | 'appointment' | 'inquiry';
    preferredTime?: string;
    notes?: string;
    jobType?: string;
    otherData?: string;
    propertyType?: string;
    city?: string;
    type?: string;
}
export type ProcessedResult = {
    type: 'answer';
    text: string;
} | {
    type: 'search';
    query: SearchQuery;
} | {
    type: 'event';
    name: string;
    details: EventDetails;
} | {
    type: 'reminder';
    name: string;
    details: EventDetails;
};
export interface OpenAIResponse {
    type: 'answer' | 'search' | 'event' | 'reminder';
    content: string;
    query?: SearchQuery;
    eventName?: string;
    eventDetails?: EventDetails;
}
export interface OpenAIService {
    sendPrompt(message: string, phoneNumber?: string, name?: string, historySummary?: string): Promise<string>;
}
export interface ResponseParser {
    parseResponse(response: string): ProcessedResult;
}
export declare enum EventType {
    GENERATE_PROPERTY_PDF = "generate_property_pdf",
    SCHEDULE_CALLBACK = "schedule_callback",
    BOOK_APPOINTMENT = "book_appointment",
    REQUEST_MORE_INFO = "request_more_info",
    SAVE_FAVORITE = "save_favorite"
}
export declare enum PropertyType {
    VILLA = "\u0641\u064A\u0644\u0627",
    APARTMENT = "\u0634\u0642\u0629",
    FLOOR = "\u062F\u0648\u0631",
    RESORT = "\u0627\u0633\u062A\u0631\u0627\u062D\u0629",
    LAND = "\u0623\u0631\u0636",
    SCHEME = "\u0645\u062E\u0637\u0637",
    COMMERCIAL_SHOP = "\u0645\u062D\u0644 \u062A\u062C\u0627\u0631\u064A",
    OFFICE = "\u0645\u0643\u062A\u0628",
    BUILDING = "\u0639\u0645\u0627\u0631\u0629",
    TRADITIONAL_HOUSE = "\u0628\u064A\u062A \u0634\u0639\u0628\u064A"
}
export declare enum PropertyPurpose {
    SALE = "\u0628\u064A\u0639",
    RENT = "\u0625\u064A\u062C\u0627\u0631",
    INVESTMENT = "\u0627\u0633\u062A\u062B\u0645\u0627\u0631"
}
export declare enum PriceRange {
    ECONOMIC = "\u0627\u0642\u062A\u0635\u0627\u062F\u064A",
    MEDIUM = "\u0645\u062A\u0648\u0633\u0637",
    LUXURY = "\u0641\u0627\u062E\u0631",
    PREMIUM = "\u0631\u0627\u0642\u064A \u062C\u062F\u0627\u064B"
}
export declare enum JeddahDistricts {
    RAWDAH = "\u0627\u0644\u0631\u0648\u0636\u0629",
    HAMRA = "\u0627\u0644\u062D\u0645\u0631\u0627\u0621",
    BALAD = "\u0627\u0644\u0628\u0644\u062F",
    ABHUR_NORTH = "\u0623\u0628\u062D\u0631 \u0627\u0644\u0634\u0645\u0627\u0644\u064A\u0629",
    ABHUR_SOUTH = "\u0623\u0628\u062D\u0631 \u0627\u0644\u062C\u0646\u0648\u0628\u064A\u0629",
    MARJAN = "\u0627\u0644\u0645\u0631\u062C\u0627\u0646",
    BEACH = "\u0627\u0644\u0634\u0627\u0637\u0626",
    SAFA = "\u0627\u0644\u0635\u0641\u0627",
    MOHAMMADIYAH = "\u0627\u0644\u0645\u062D\u0645\u062F\u064A\u0629",
    REHAB = "\u0627\u0644\u0631\u062D\u0627\u0628",
    SAMER = "\u0627\u0644\u0633\u0627\u0645\u0631",
    FAISALIYAH = "\u0627\u0644\u0641\u064A\u0635\u0644\u064A\u0629",
    SALEHIYAH = "\u0627\u0644\u0635\u0627\u0644\u062D\u064A\u0629",
    INDUSTRIAL_CITY = "\u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0635\u0646\u0627\u0639\u064A\u0629",
    AIRPORT = "\u0627\u0644\u0645\u0637\u0627\u0631",
    THAGHR = "\u0627\u0644\u062B\u063A\u0631",
    FAIHA = "\u0627\u0644\u0641\u064A\u062D\u0627\u0621",
    KHALIDIYAH = "\u0627\u0644\u062E\u0627\u0644\u062F\u064A\u0629",
    WIZARIYAH = "\u0627\u0644\u0648\u0632\u064A\u0631\u064A\u0629",
    ZAHRA = "\u0627\u0644\u0632\u0647\u0631\u0627\u0621",
    MARWAH = "\u0627\u0644\u0645\u0631\u0648\u0629",
    ANDALUS = "\u0627\u0644\u0623\u0646\u062F\u0644\u0633",
    AJAWEED = "\u0627\u0644\u0623\u062C\u0627\u0648\u064A\u062F",
    UNIVERSITY = "\u0627\u0644\u062C\u0627\u0645\u0639\u0629",
    SAHIFAH = "\u0627\u0644\u0635\u062D\u064A\u0641\u0629",
    RABWAH = "\u0627\u0644\u0631\u0628\u0648\u0629",
    SHARAFIYAH = "\u0627\u0644\u0634\u0631\u0641\u064A\u0629",
    KANDARAH = "\u0627\u0644\u0643\u0646\u062F\u0631\u0629",
    SHABAH = "\u0627\u0644\u0634\u0639\u0628\u0629",
    JAWHARA = "\u0627\u0644\u062C\u0648\u0647\u0631\u0629",
    SALAMAH = "\u0627\u0644\u0633\u0644\u0627\u0645\u0629",
    RAWABI = "\u0627\u0644\u0631\u0648\u0627\u0628\u064A",
    FURUSIYAH = "\u0627\u0644\u0641\u0631\u0648\u0633\u064A\u0629",
    WAHAH = "\u0627\u0644\u0648\u0627\u062D\u0629",
    KHUMRAH = "\u0627\u0644\u062E\u0645\u0631\u0629",
    HARAZAT = "\u0627\u0644\u062D\u0631\u0627\u0632\u0627\u062A",
    SAWARI = "\u0627\u0644\u0635\u0648\u0627\u0631\u064A",
    SHATBI = "\u0627\u0644\u0634\u0627\u0637\u0628\u064A",
    TAYBAT = "\u0627\u0644\u0637\u064A\u0628\u0627\u062A"
}
export type RequestType = 'pdf' | 'callback' | 'appointment' | 'inquiry';
export interface JobTitle {
    male: 'وسيط عقاري';
    female: 'وسيطة عقارية';
}
export type Gender = 'male' | 'female' | 'unknown';
export interface NameAnalysis {
    name: string;
    gender: Gender;
    jobTitle: string;
}
export interface AIError {
    type: 'parsing' | 'validation' | 'service';
    message: string;
    originalResponse?: string;
}
export interface ResponseValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export interface EnhancedResponseParser extends ResponseParser {
    validateResponse(response: string): ResponseValidation;
    analyzeNameGender(name: string): NameAnalysis;
}
export interface AIServiceConfig {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
    defaultCity: string;
    defaultJobTitles: JobTitle;
}
export interface GeneratePropertyPdfEventDetails extends EventDetails {
}
export interface AIUtils {
    createSystemPrompt(phoneNumber?: string, name?: string, historySummary?: string): string;
    createUserPrompt(message: string): string;
    detectGender(name: string): Gender;
    getJobTitle(gender: Gender): string;
    validatePropertyType(type: string): boolean;
    validateDistrict(district: string): boolean;
    parsePrice(priceText: string): number | null;
}
