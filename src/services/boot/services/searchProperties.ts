import { PrismaClient, Property, PropertyType, PropertyStatus, Prisma } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export interface SearchResult {
  properties: Property[];
  totalCount: number;
  message: string;
  hasMore: boolean;
}

interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  type?: PropertyType;
  status?: PropertyStatus;
  city?: string;
  country?: string;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  furnished?: boolean;
  petFriendly?: boolean;
  parking?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  agentId?: string;
  yearBuilt?: number;
  minParking?: number;
}

interface SearchOptions {
  includeInactive?: boolean;
  prioritizeFeatured?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'price' | 'createdAt' | 'viewCount' | 'area' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

// Helper function to check if a value is valid (not null or undefined)
function isValidValue(value: any): boolean {
  return value !== null && value !== undefined;
}

// Simplified text normalization
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\u064B-\u0652]/g, '') // Remove Arabic diacritics
    .replace(/[.,!?;:()\-]/g, ' ')  // Replace punctuation with spaces
    .replace(/\s+/g, ' ')           // Collapse multiple spaces
    .trim();
}

// Extract tokens for similarity calculations
function extractTokens(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized.split(/\s+/).filter(token => token.length > 1);
}

// Simple string similarity using Levenshtein distance
function calculateStringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const normalized1 = normalizeText(str1);
  const normalized2 = normalizeText(str2);
  
  if (normalized1 === normalized2) return 1;
  
  const distance = calculateLevenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);
  
  return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

// Levenshtein distance calculation
function calculateLevenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Map user input to PropertyType enum
function mapToPropertyType(input: string): PropertyType | undefined {
  if (!input) return undefined;
  
  const normalized = normalizeText(input);
  const typeMap: Record<string, PropertyType> = {
    "فيلا": "VILLA",
    "villa": "VILLA",
    "house": "VILLA",
    "فلل": "VILLA",
    "شقة": "APARTMENT",
    "apartment": "APARTMENT",
    "flat": "APARTMENT",
    "شقق": "APARTMENT",
    "تاون هاوس": "TOWNHOUSE",
    "تاونهاوس": "TOWNHOUSE",
    "townhouse": "TOWNHOUSE",
    "duplex": "TOWNHOUSE",
    "دوبلكس": "TOWNHOUSE",
    "بنتهاوس": "PENTHOUSE",
    "penthouse": "PENTHOUSE",
    "روف": "PENTHOUSE",
    "أعلى دور": "PENTHOUSE",
    "استوديو": "STUDIO",
    "studio": "STUDIO",
    "غرفة واحدة": "STUDIO",
    "مكتب": "OFFICE",
    "office": "OFFICE",
    "مكاتب": "OFFICE",
    "محل": "SHOP",
    "shop": "SHOP",
    "store": "SHOP",
    "متجر": "SHOP",
    "مستودع": "WAREHOUSE",
    "warehouse": "WAREHOUSE",
    "مخزن": "WAREHOUSE",
    "أرض": "LAND",
    "land": "LAND",
    "plot": "LAND",
    "قطعة أرض": "LAND",
    "قطعة": "LAND",
    "مبنى": "BUILDING",
    "building": "BUILDING",
    "عمارة": "BUILDING"
  };
  
  return typeMap[normalized];
}

// Build Prisma where clause from filters and search query
function buildWhereClause(filters: SearchFilters, searchQuery?: string): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {};

  // Price filters - only add if values are defined and valid
  const priceConditions: any = {};
  if (isValidValue(filters.minPrice)) {
    priceConditions.gte = filters.minPrice;
  }
  if (isValidValue(filters.maxPrice)) {
    priceConditions.lte = filters.maxPrice;
  }
  if (Object.keys(priceConditions).length > 0) {
    where.price = priceConditions;
  }

  // Basic property filters
  if (filters.type) where.type = filters.type;
  if (filters.status) where.status = filters.status;
  if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
  if (filters.country) where.country = { contains: filters.country, mode: 'insensitive' };

  // Room filters - only add if values are defined and valid
  const bedroomConditions: any = {};
  if (isValidValue(filters.minBedrooms)) {
    bedroomConditions.gte = filters.minBedrooms;
  }
  if (isValidValue(filters.maxBedrooms)) {
    bedroomConditions.lte = filters.maxBedrooms;
  }
  if (Object.keys(bedroomConditions).length > 0) {
    where.bedrooms = bedroomConditions;
  }

  const bathroomConditions: any = {};
  if (isValidValue(filters.minBathrooms)) {
    bathroomConditions.gte = filters.minBathrooms;
  }
  if (isValidValue(filters.maxBathrooms)) {
    bathroomConditions.lte = filters.maxBathrooms;
  }
  if (Object.keys(bathroomConditions).length > 0) {
    where.bathrooms = bathroomConditions;
  }

  // Area filters - only add if values are defined and valid
  const areaConditions: any = {};
  if (isValidValue(filters.minArea)) {
    areaConditions.gte = filters.minArea;
  }
  if (isValidValue(filters.maxArea)) {
    areaConditions.lte = filters.maxArea;
  }
  if (Object.keys(areaConditions).length > 0) {
    where.area = areaConditions;
  }

  // Parking filters
  if (isValidValue(filters.minParking)) {
    where.parking = { gte: filters.minParking };
  } else if (filters.parking !== undefined) {
    where.parking = filters.parking ? { gt: 0 } : { lte: 0 };
  }

  // Boolean filters - only add if explicitly set
  if (filters.furnished !== undefined) where.furnished = filters.furnished;
  if (filters.petFriendly !== undefined) where.petFriendly = filters.petFriendly;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;

  // Other filters
  if (filters.agentId) where.agentId = filters.agentId;
  if (isValidValue(filters.yearBuilt)) {
    where.yearBuilt = filters.yearBuilt;
  }

  // Text search across multiple fields
  if (searchQuery && searchQuery.trim()) {
    const searchTerms = searchQuery.trim().split(/\s+/);
    
    where.OR = [
      { title: { contains: searchQuery, mode: 'insensitive' } },
      { description: { contains: searchQuery, mode: 'insensitive' } },
      { location: { contains: searchQuery, mode: 'insensitive' } },
      { address: { contains: searchQuery, mode: 'insensitive' } },
      { features: { hasSome: searchTerms } },
      { amenities: { hasSome: searchTerms } }
    ];
  }

  return where;
}

// Build Prisma order by clause
function buildOrderByClause(options: SearchOptions): Prisma.PropertyOrderByWithRelationInput[] {
  const orderBy: Prisma.PropertyOrderByWithRelationInput[] = [];

  // Prioritize featured properties if requested
  if (options.prioritizeFeatured) {
    orderBy.push({ isFeatured: 'desc' });
  }

  // Add main sort criteria
  if (options.sortBy && options.sortBy !== 'relevance') {
    const sortOrder = options.sortOrder || 'desc';
    
    switch (options.sortBy) {
      case 'price':
        orderBy.push({ price: sortOrder });
        break;
      case 'createdAt':
        orderBy.push({ createdAt: sortOrder });
        break;
      case 'viewCount':
        orderBy.push({ viewCount: sortOrder });
        break;
      case 'area':
        orderBy.push({ area: sortOrder });
        break;
    }
  } else {
    // Default sort by creation date
    orderBy.push({ createdAt: 'desc' });
  }

  return orderBy;
}

// Parse search query and extract filters
function parseSearchQuery(query: any): { cleanQuery: string; filters: SearchFilters } {
  const filters: SearchFilters = {};
  let cleanQuery = '';

  // Handle different query formats
  if (typeof query === 'string') {
    cleanQuery = query;
  } else if (typeof query === 'object' && query !== null) {
    // Extract filters from query object - only include valid values
    const fieldMap: (keyof SearchFilters)[] = [
      'city', 'type', 'minPrice', 'maxPrice', 'minBedrooms', 'maxBedrooms',
      'minBathrooms', 'maxBathrooms', 'minArea', 'maxArea', 'furnished',
      'petFriendly', 'parking', 'yearBuilt', 'country'
    ];

    for (const key of fieldMap) {
      const value = query[key];
      
      if (key === 'type' && value !== undefined && value !== null) {
        const mappedType = mapToPropertyType(value);
        if (mappedType) {
          filters.type = mappedType;
        }
      } else if (key !== 'type' && isValidValue(value)) {
        // Only assign valid values (not null or undefined)
        (filters as any)[key] = value;
      }
    }

    // Extract text search terms
    const textFields = ['title', 'description', 'location', 'address'];
    const textParts: string[] = [];
    
    for (const field of textFields) {
      if (query[field] && typeof query[field] === 'string') {
        textParts.push(query[field]);
      }
    }
    
    cleanQuery = textParts.join(' ');
    
    // Handle district field separately - map to city if no city is provided
    if (query.district && typeof query.district === 'string' && !filters.city) {
      filters.city = query.district;
    }
  }

  // If we have a string query, parse it for natural language
  if (cleanQuery && typeof cleanQuery === 'string') {
    const parsed = parseNaturalLanguageQuery(cleanQuery);
    return {
      cleanQuery: parsed.cleanQuery,
      filters: { ...filters, ...parsed.filters }
    };
  }

  return { cleanQuery: cleanQuery.trim(), filters };
}

// Enhanced natural language parsing for Arabic locations
export function parseNaturalLanguageQuery(query: string): { cleanQuery: string; filters: SearchFilters } {
  const filters: SearchFilters = {};
  let cleanQuery = normalizeText(query);
  
  // Extract property type first
  const typeMatches: [RegExp, PropertyType][] = [
    [/(شقة|شقق|apartment|flat)/i, PropertyType.APARTMENT],
    [/(فيلا|فلل|villa)/i, PropertyType.VILLA],
    [/(تاون|townhouse)/i, PropertyType.TOWNHOUSE],
    [/(بنتهاوس|penthouse)/i, PropertyType.PENTHOUSE],
    [/(استوديو|studio)/i, PropertyType.STUDIO],
    [/(مكتب|مكاتب|office)/i, PropertyType.OFFICE],
    [/(محل|متجر|shop|store)/i, PropertyType.SHOP],
    [/(مستودع|مخزن|warehouse)/i, PropertyType.WAREHOUSE],
    [/(أرض|قطعة|land|plot)/i, PropertyType.LAND],
    [/(مبنى|عمارة|building)/i, PropertyType.BUILDING]
  ];
  
  for (const [regex, type] of typeMatches) {
    if (regex.test(cleanQuery)) {
      filters.type = type;
      cleanQuery = cleanQuery.replace(regex, '').trim();
      break;
    }
  }

  // Enhanced location matching - prioritize specific districts
  const locationMatches: [RegExp, string][] = [
    // Abhar districts (most specific first)
    [/(أبحر الشمالية|abhar al shamaliyah)/i, 'أبحر الشمالية'],
    [/(أبحر الجنوبية|abhar al janubiyah)/i, 'أبحر الجنوبية'],
    [/(أبحره|أبحر|abhar)/i, 'أبحر الشمالية'], // Default to North Abhar
    
    // Other Jeddah districts
    [/(الروضة|al rawdah)/i, 'الروضة'],
    [/(الحمراء|al hamra)/i, 'الحمراء'],
    [/(المرجان|al marjan)/i, 'المرجان'],
    [/(الشاطئ|al shati)/i, 'الشاطئ'],
    [/(الصفا|al safa)/i, 'الصفا'],
    [/(المحمدية|al muhammadiyah)/i, 'المحمدية'],
    [/(الرحاب|al rahab)/i, 'الرحاب'],
    [/(السامر|al samer)/i, 'السامر'],
    [/(الفيصلية|al faisaliyah)/i, 'الفيصلية'],
    [/(الصالحية|al salhiyah)/i, 'الصالحية'],
    [/(الخالدية|al khalidiyah)/i, 'الخالدية'],
    [/(الوزيرية|al waziriyah)/i, 'الوزيرية'],
    [/(الزهراء|al zahra)/i, 'الزهراء'],
    [/(المروة|al marwah)/i, 'المروة'],
    [/(الأندلس|al andalus)/i, 'الأندلس'],
    [/(الأجاويد|al ajawid)/i, 'الأجاويد'],
    [/(الجامعة|al jamiah)/i, 'الجامعة'],
    [/(الصحيفة|al sahifah)/i, 'الصحيفة'],
    [/(الربوة|al rabwah)/i, 'الربوة'],
    [/(الشرفية|al sharafiyah)/i, 'الشرفية'],
    [/(الكندرة|al kandarah)/i, 'الكندرة'],
    [/(الشعبة|al shuabah)/i, 'الشعبة'],
    [/(الجوهرة|al jawharah)/i, 'الجوهرة'],
    [/(السلامة|al salamah)/i, 'السلامة'],
    [/(الروابي|al rawabi)/i, 'الروابي'],
    [/(الفروسية|al furusiyah)/i, 'الفروسية'],
    [/(الواحة|al wahah)/i, 'الواحة'],
    [/(الخمرة|al khamrah)/i, 'الخمرة'],
    [/(الحرازات|al harazat)/i, 'الحرازات'],
    [/(الصواري|al sawari)/i, 'الصواري'],
    [/(الشاطبي|al shatbi)/i, 'الشاطبي'],
    [/(الطيبات|al tayibat)/i, 'الطيبات'],
    [/(الشرقية|al sharqiyah)/i, 'الشرقية'],
    [/(الغربية|al gharbiyah)/i, 'الغربية'],
    [/(الشمالية|al shamaliyah)/i, 'الشمالية'],
    [/(الجنوبية|al janubiyah)/i, 'الجنوبية'],
    
    // Major cities
    [/(جدة|jeddah)/i, 'جدة'],
    [/(الرياض|riyadh)/i, 'الرياض'],
    [/(دبي|dubai)/i, 'دبي'],
    [/(أبو ظبي|abu dhabi)/i, 'أبو ظبي'],
    [/(الشارقة|sharjah)/i, 'الشارقة']
  ];
  
  for (const [regex, location] of locationMatches) {
    if (regex.test(cleanQuery)) {
      filters.city = location;
      cleanQuery = cleanQuery.replace(regex, '').trim();
      break;
    }
  }
  
  // Extract price range
  const priceMatch = cleanQuery.match(/(\d+(?:,\d+)?)\s*[-–]\s*(\d+(?:,\d+)?)/);
  if (priceMatch) {
    const minPrice = parseFloat(priceMatch[1].replace(',', ''));
    const maxPrice = parseFloat(priceMatch[2].replace(',', ''));
    if (!isNaN(minPrice)) filters.minPrice = minPrice;
    if (!isNaN(maxPrice)) filters.maxPrice = maxPrice;
    cleanQuery = cleanQuery.replace(priceMatch[0], '').trim();
  }
  
  // Extract bedroom count
  const bedroomMatch = cleanQuery.match(/(\d+)\s*(غرف|غرفة|bedroom|br|bed)/i);
  if (bedroomMatch) {
    const bedrooms = parseInt(bedroomMatch[1]);
    if (!isNaN(bedrooms)) {
      filters.minBedrooms = bedrooms;
      filters.maxBedrooms = bedrooms;
    }
    cleanQuery = cleanQuery.replace(bedroomMatch[0], '').trim();
  }
  
  // Extract bathroom count
  const bathroomMatch = cleanQuery.match(/(\d+)\s*(حمام|bathroom|bath|ba)/i);
  if (bathroomMatch) {
    const bathrooms = parseInt(bathroomMatch[1]);
    if (!isNaN(bathrooms)) {
      filters.minBathrooms = bathrooms;
      filters.maxBathrooms = bathrooms;
    }
    cleanQuery = cleanQuery.replace(bathroomMatch[0], '').trim();
  }
  
  // Extract features
  if (/(مفروش|مؤثث|furnished)/i.test(cleanQuery)) {
    filters.furnished = true;
    cleanQuery = cleanQuery.replace(/(مفروش|مؤثث|furnished)/gi, '').trim();
  }
  
  if (/(حيوانات|pets?|pet.friendly)/i.test(cleanQuery)) {
    filters.petFriendly = true;
    cleanQuery = cleanQuery.replace(/(حيوانات|pets?|pet.friendly)/gi, '').trim();
  }
  
  if (/(موقف|parking|garage)/i.test(cleanQuery)) {
    filters.parking = true;
    cleanQuery = cleanQuery.replace(/(موقف|parking|garage)/gi, '').trim();
  }
  
  return { cleanQuery: cleanQuery.trim(), filters };
}

// Main search function - simplified and unified
export async function searchProperties(
  query: any,
  filters: SearchFilters = {},
  options: SearchOptions = {}
): Promise<SearchResult> {
  try {
    console.log('🔍 Search input:', { query, filters, options });
    
    // Set default options
    const searchOptions = {
      limit: 10,
      offset: 0,
      includeInactive: false,
      prioritizeFeatured: true,
      sortBy: 'relevance' as const,
      sortOrder: 'desc' as const,
      ...options
    };

    // Ensure active properties are included unless explicitly requested
    if (!searchOptions.includeInactive) {
      filters.isActive = true;
    }

    // Parse query and merge with filters
    const { cleanQuery, filters: queryFilters } = parseSearchQuery(query);
    const mergedFilters = { ...filters, ...queryFilters };
    
    console.log('🔍 Parsed query:', { cleanQuery, queryFilters, mergedFilters });

    // Build Prisma query
    const where = buildWhereClause(mergedFilters, cleanQuery);
    const orderBy = buildOrderByClause(searchOptions);
    
    console.log('🔍 Prisma where clause:', JSON.stringify(where, null, 2));

    // Get total count
    const totalCount = await prisma.property.count({ where });
    console.log('🔍 Total count:', totalCount);
    
    if (totalCount === 0) {
      console.log('🔍 No properties found');
      return {
        properties: [],
        totalCount: 0,
        message: "معذرة، لا توجد عقارات تطابق معايير البحث. / Sorry, no properties match the search criteria.",
        hasMore: false
      };
    }

    // Get properties with pagination
    const properties = await prisma.property.findMany({
      where,
      orderBy,
      take: searchOptions.limit,
      skip: searchOptions.offset
    });

    console.log('🔍 Found properties:', properties.length);

    // Increment view count for returned properties
    if (properties.length > 0) {
      await prisma.property.updateMany({
        where: {
          id: {
            in: properties.map((p: { id: any; }) => p.id)
          }
        },
        data: {
          viewCount: {
            increment: 1
          }
        }
      });
    }

    const hasMore = searchOptions.offset + properties.length < totalCount;
    const resultMessage = properties.length === 1 
      ? `تم العثور على عقار واحد مطابق / Found 1 matching property`
      : `تم العثور على ${properties.length} عقار من أصل ${totalCount} / Found ${properties.length} of ${totalCount} properties`;

    console.log('🔍 Search result:', { properties: properties.length, totalCount, message: resultMessage });

    return {
      properties,
      totalCount,
      message: resultMessage,
      hasMore
    };

  } catch (error) {
    console.error('Search error:', error);
    return {
      properties: [],
      totalCount: 0,
      message: "حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى. / An error occurred during search. Please try again.",
      hasMore: false
    };
  }
}

// Get similar properties based on a given property
export async function getSimilarProperties(
  propertyId: string,
  limit: number = 5
): Promise<Property[]> {
  try {
    const baseProperty = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!baseProperty) {
      return [];
    }

    // Find similar properties based on type, city, and price range
    const priceRange = baseProperty.price * 0.3; // 30% price range
    const where: Prisma.PropertyWhereInput = {
      id: { not: propertyId },
      isActive: true,
      OR: [
        {
          AND: [
            { type: baseProperty.type },
            { city: baseProperty.city },
            { 
              price: {
                gte: baseProperty.price - priceRange,
                lte: baseProperty.price + priceRange
              }
            }
          ]
        },
        {
          AND: [
            { type: baseProperty.type },
            { bedrooms: baseProperty.bedrooms },
            { city: baseProperty.city }
          ]
        }
      ]
    };

    const similarProperties = await prisma.property.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { viewCount: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });

    return similarProperties;
  } catch (error) {
    console.error('Error getting similar properties:', error);
    return [];
  }
}

// Get property recommendations
export async function getPropertyRecommendations(
  userId: string,
  limit: number = 10
): Promise<Property[]> {
  try {
    return await prisma.property.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { isFeatured: 'desc' },
        { viewCount: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

// Get trending properties (most viewed recently)
export async function getTrendingProperties(limit: number = 10): Promise<Property[]> {
  try {
    return await prisma.property.findMany({
      where: {
        isActive: true,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      orderBy: [
        { viewCount: 'desc' },
        { isFeatured: 'desc' }
      ],
      take: limit
    });
  } catch (error) {
    console.error('Error getting trending properties:', error);
    return [];
  }
}