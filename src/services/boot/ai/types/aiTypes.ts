// Types and interfaces for AI module
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
  // Legacy fields for backward compatibility
  otherData?: string;
  propertyType?: string;
  city?: string;
  type?: string;
}

export type ProcessedResult =
  | { type: 'answer'; text: string }
  | { type: 'search'; query: SearchQuery }
  | { type: 'event'; name: string; details: EventDetails };

export interface OpenAIResponse {
  type: 'answer' | 'search' | 'event';
  content: string;
  query?: SearchQuery;
  eventName?: string;
  eventDetails?: EventDetails;
}

export interface OpenAIService {
  sendPrompt(
    message: string, 
    phoneNumber?: string, 
    name?: string, 
    historySummary?: string
  ): Promise<string>;
}

export interface ResponseParser {
  parseResponse(response: string): ProcessedResult;
}

// Event types enumeration
export enum EventType {
  GENERATE_PROPERTY_PDF = 'generate_property_pdf',
  SCHEDULE_CALLBACK = 'schedule_callback',
  BOOK_APPOINTMENT = 'book_appointment',
  REQUEST_MORE_INFO = 'request_more_info',
  SAVE_FAVORITE = 'save_favorite'
}

// Property types enumeration
export enum PropertyType {
  VILLA = 'فيلا',
  APARTMENT = 'شقة',
  FLOOR = 'دور',
  RESORT = 'استراحة',
  LAND = 'أرض',
  SCHEME = 'مخطط',
  COMMERCIAL_SHOP = 'محل تجاري',
  OFFICE = 'مكتب',
  BUILDING = 'عمارة',
  TRADITIONAL_HOUSE = 'بيت شعبي'
}

// Purpose types enumeration
export enum PropertyPurpose {
  SALE = 'بيع',
  RENT = 'إيجار',
  INVESTMENT = 'استثمار'
}

// Price range enumeration
export enum PriceRange {
  ECONOMIC = 'اقتصادي',
  MEDIUM = 'متوسط',
  LUXURY = 'فاخر',
  PREMIUM = 'راقي جداً'
}

// Jeddah districts enumeration
export enum JeddahDistricts {
  RAWDAH = 'الروضة',
  HAMRA = 'الحمراء',
  BALAD = 'البلد',
  ABHUR_NORTH = 'أبحر الشمالية',
  ABHUR_SOUTH = 'أبحر الجنوبية',
  MARJAN = 'المرجان',
  BEACH = 'الشاطئ',
  SAFA = 'الصفا',
  MOHAMMADIYAH = 'المحمدية',
  REHAB = 'الرحاب',
  SAMER = 'السامر',
  FAISALIYAH = 'الفيصلية',
  SALEHIYAH = 'الصالحية',
  INDUSTRIAL_CITY = 'المدينة الصناعية',
  AIRPORT = 'المطار',
  THAGHR = 'الثغر',
  FAIHA = 'الفيحاء',
  KHALIDIYAH = 'الخالدية',
  WIZARIYAH = 'الوزيرية',
  ZAHRA = 'الزهراء',
  MARWAH = 'المروة',
  ANDALUS = 'الأندلس',
  AJAWEED = 'الأجاويد',
  UNIVERSITY = 'الجامعة',
  SAHIFAH = 'الصحيفة',
  RABWAH = 'الربوة',
  SHARAFIYAH = 'الشرفية',
  KANDARAH = 'الكندرة',
  SHABAH = 'الشعبة',
  JAWHARA = 'الجوهرة',
  SALAMAH = 'السلامة',
  RAWABI = 'الروابي',
  FURUSIYAH = 'الفروسية',
  WAHAH = 'الواحة',
  KHUMRAH = 'الخمرة',
  HARAZAT = 'الحرازات',
  SAWARI = 'الصواري',
  SHATBI = 'الشاطبي',
  TAYBAT = 'الطيبات'
}

// Request types for events
export type RequestType = 'pdf' | 'callback' | 'appointment' | 'inquiry';

// Job titles with gender support
export interface JobTitle {
  male: 'وسيط عقاري';
  female: 'وسيطة عقارية';
}

// Utility type for gender detection
export type Gender = 'male' | 'female' | 'unknown';

// Helper interface for name analysis
export interface NameAnalysis {
  name: string;
  gender: Gender;
  jobTitle: string;
}

// Error handling interface
export interface AIError {
  type: 'parsing' | 'validation' | 'service';
  message: string;
  originalResponse?: string;
}

// Response validation interface
export interface ResponseValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Enhanced response parser with validation
export interface EnhancedResponseParser extends ResponseParser {
  validateResponse(response: string): ResponseValidation;
  analyzeNameGender(name: string): NameAnalysis;
  parseResponse(response: string): ProcessedResult;
}

// Configuration interface for AI service
export interface AIServiceConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  defaultCity: string;
  defaultJobTitles: JobTitle;
}

// Legacy support - keeping old interface name for backward compatibility
export interface GeneratePropertyPdfEventDetails extends EventDetails {}

// Export utility functions type
export interface AIUtils {
  createSystemPrompt(phoneNumber?: string, name?: string, historySummary?: string): string;
  createUserPrompt(message: string): string;
  detectGender(name: string): Gender;
  getJobTitle(gender: Gender): string;
  validatePropertyType(type: string): boolean;
  validateDistrict(district: string): boolean;
  parsePrice(priceText: string): number | null;
}