import { PrismaClient, Property, PropertyType, PropertyStatus, Prisma } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

 
// Types for search functionality
interface SearchResult {
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

interface PropertySimilarityResult {
  property: Property;
  similarity: number;
}

// Helper function to normalize text for better matching (Arabic & English)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove Arabic diacritics
    .replace(/[\u064B-\u0652]/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove common punctuation
    .replace(/[.,!?;:()\-]/g, ' ')
    .trim();
}

// Extract meaningful tokens from text
function extractTokens(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized.split(/\s+/).filter(token => token.length > 1);
}

// Extract searchable content from property
function extractPropertyContent(property: Property): string {
  const content = [
    property.title,
    property.description,
    property.location,
    property.address,
    property.city,
    property.country,
    property.type.toLowerCase(),
    property.status.toLowerCase(),
    ...property.features,
    ...property.amenities,
    property.utilities || '',
    property.contactInfo || ''
  ];

  // Add descriptive terms based on property attributes
  const descriptiveTerms: string[] = [];
  
  if (property.bedrooms) {
    descriptiveTerms.push(`${property.bedrooms} غرف نوم`, `${property.bedrooms} bedroom`, `${property.bedrooms}br`);
  }
  
  if (property.bathrooms) {
    descriptiveTerms.push(`${property.bathrooms} حمام`, `${property.bathrooms} bathroom`, `${property.bathrooms}ba`);
  }
  
  if (property.furnished) {
    descriptiveTerms.push('مفروش', 'furnished', 'مؤثث');
  }
  
  if (property.petFriendly) {
    descriptiveTerms.push('يسمح بالحيوانات', 'pet friendly', 'pets allowed');
  }
  
  if (property.parking && property.parking > 0) {
    descriptiveTerms.push('موقف سيارات', 'parking', 'garage');
  }

  if (property.yearBuilt) {
    descriptiveTerms.push(`built ${property.yearBuilt}`, `بناء ${property.yearBuilt}`);
  }

  // Add property type translations
  const typeTranslations: Record<PropertyType, string[]> = {
    APARTMENT: ['شقة', 'apartment', 'flat', 'شقق'],
    VILLA: ['فيلا', 'villa', 'house', 'فلل'],
    TOWNHOUSE: ['تاون هاوس', 'townhouse', 'duplex', 'دوبلكس'],
    PENTHOUSE: ['بنتهاوس', 'penthouse', 'روف', 'أعلى دور'],
    STUDIO: ['استوديو', 'studio', 'غرفة واحدة'],
    OFFICE: ['مكتب', 'office', 'مكاتب'],
    SHOP: ['محل', 'shop', 'store', 'متجر'],
    WAREHOUSE: ['مستودع', 'warehouse', 'مخزن'],
    LAND: ['أرض', 'land', 'plot', 'قطعة أرض'],
    BUILDING: ['مبنى', 'building', 'عمارة']
  };

  if (typeTranslations[property.type]) {
    descriptiveTerms.push(...typeTranslations[property.type]);
  }

  return [...content, ...descriptiveTerms].join(' ');
}

// Calculate Jaccard similarity (token overlap)
function calculateJaccardSimilarity(tokens1: string[], tokens2: string[]): number {
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);
  
  const intersection = new Set([...set1].filter(token => set2.has(token)));
  const union = new Set([...set1, ...set2]);
  
  return union.size === 0 ? 0 : intersection.size / union.size;
}

// Calculate cosine similarity using term frequency
function calculateCosineSimilarity(tokens1: string[], tokens2: string[]): number {
  const tf1 = createTermFrequencyMap(tokens1);
  const tf2 = createTermFrequencyMap(tokens2);
  
  const allTerms = new Set([...Object.keys(tf1), ...Object.keys(tf2)]);
  
  if (allTerms.size === 0) return 0;
  
  const vector1: number[] = [];
  const vector2: number[] = [];
  
  allTerms.forEach(term => {
    vector1.push(tf1[term] || 0);
    vector2.push(tf2[term] || 0);
  });
  
  const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
  
  return magnitude1 === 0 || magnitude2 === 0 ? 0 : dotProduct / (magnitude1 * magnitude2);
}

// Create term frequency map
function createTermFrequencyMap(tokens: string[]): Record<string, number> {
  const tfMap: Record<string, number> = {};
  tokens.forEach(token => {
    tfMap[token] = (tfMap[token] || 0) + 1;
  });
  return tfMap;
}

// Calculate Levenshtein distance
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

// Convert Levenshtein distance to similarity percentage
function levenshteinToSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = calculateLevenshteinDistance(str1, str2);
  return (maxLength - distance) / maxLength;
}

// Build Prisma where clause from filters
function buildWhereClause(filters: SearchFilters, query?: string): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {};

  // Basic filters
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }

  if (filters.type) where.type = filters.type;
  if (filters.status) where.status = filters.status;
  if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };
  if (filters.country) where.country = { contains: filters.country, mode: 'insensitive' };

  // Room filters
  if (filters.minBedrooms !== undefined || filters.maxBedrooms !== undefined) {
    where.bedrooms = {};
    if (filters.minBedrooms !== undefined) where.bedrooms.gte = filters.minBedrooms;
    if (filters.maxBedrooms !== undefined) where.bedrooms.lte = filters.maxBedrooms;
  }

  if (filters.minBathrooms !== undefined || filters.maxBathrooms !== undefined) {
    where.bathrooms = {};
    if (filters.minBathrooms !== undefined) where.bathrooms.gte = filters.minBathrooms;
    if (filters.maxBathrooms !== undefined) where.bathrooms.lte = filters.maxBathrooms;
  }

  // Area filters
  if (filters.minArea !== undefined || filters.maxArea !== undefined) {
    where.area = {};
    if (filters.minArea !== undefined) where.area.gte = filters.minArea;
    if (filters.maxArea !== undefined) where.area.lte = filters.maxArea;
  }

  // Parking filters
  if (filters.minParking !== undefined) {
    where.parking = { gte: filters.minParking };
  }
  if (filters.parking !== undefined) {
    where.parking = filters.parking ? { gt: 0 } : { lte: 0 };
  }

  // Boolean filters
  if (filters.furnished !== undefined) where.furnished = filters.furnished;
  if (filters.petFriendly !== undefined) where.petFriendly = filters.petFriendly;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;
  if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;

  // Agent filter
  if (filters.agentId) where.agentId = filters.agentId;

  // Year built filter
  if (filters.yearBuilt) where.yearBuilt = filters.yearBuilt;

  // Text search across multiple fields
  if (query && query.trim()) {
    const searchTerms = query.trim().split(/\s+/);
    
    where.OR = [
      {
        title: {
          contains: query,
          mode: 'insensitive'
        }
      },
      {
        description: {
          contains: query,
          mode: 'insensitive'
        }
      },
      {
        location: {
          contains: query,
          mode: 'insensitive'
        }
      },
      {
        address: {
          contains: query,
          mode: 'insensitive'
        }
      },
      {
        features: {
          hasSome: searchTerms
        }
      },
      {
        amenities: {
          hasSome: searchTerms
        }
      }
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

// Calculate comprehensive similarity score for a property
function calculatePropertySimilarity(query: string, property: Property): number {
  const queryTokens = extractTokens(query);
  const propertyContent = extractPropertyContent(property);
  const propertyTokens = extractTokens(propertyContent);
  
  // Multiple similarity metrics
  const jaccardScore = calculateJaccardSimilarity(queryTokens, propertyTokens);
  const cosineScore = calculateCosineSimilarity(queryTokens, propertyTokens);
  
  // String similarity for exact matches
  const titleSimilarity = levenshteinToSimilarity(normalizeText(query), normalizeText(property.title));
  const descriptionSimilarity = levenshteinToSimilarity(normalizeText(query), normalizeText(property.description));
  const locationSimilarity = levenshteinToSimilarity(normalizeText(query), normalizeText(`${property.location} ${property.city}`));
  
  // Weighted combination of similarities
  let combinedScore = (
    jaccardScore * 0.25 +           // Token overlap
    cosineScore * 0.25 +            // Semantic similarity
    titleSimilarity * 0.25 +        // Title match
    descriptionSimilarity * 0.15 +  // Description match
    locationSimilarity * 0.10       // Location match
  );
  
  // Boost score for featured properties
  if (property.isFeatured) {
    combinedScore *= 1.05;
  }
  
  // Slight boost for active properties
  if (property.isActive) {
    combinedScore *= 1.02;
  }
  
  return Math.min(combinedScore, 1.0); // Cap at 1.0
}

// Main search function with Prisma integration
export async function searchProperties(
  query: string,
  filters: SearchFilters = {},
  options: SearchOptions = {}
): Promise<SearchResult> {
  try {
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

    // Parse query for additional filters
    const { cleanQuery, filters: parsedFilters } = parseSearchQuery(query);
    const combinedFilters = { ...filters, ...parsedFilters };

    // Build Prisma query
    const where = buildWhereClause(combinedFilters, cleanQuery);
    const orderBy = buildOrderByClause(searchOptions);

    // Get total count
    const totalCount = await prisma.property.count({ where });

    if (totalCount === 0) {
      return {
        properties: [],
        totalCount: 0,
        message: "معذرة، لا توجد عقارات تطابق معايير البحث. / Sorry, no properties match the search criteria.",
        hasMore: false
      };
    }

    // Get properties with pagination
    let properties: Property[];
    
    if (searchOptions.sortBy === 'relevance' && cleanQuery.trim()) {
      // For relevance sorting, get more results and sort by similarity
      const allProperties = await prisma.property.findMany({
        where,
        take: Math.min(totalCount, 100), // Limit to 100 for performance
        skip: searchOptions.offset
      });

      // Calculate similarity scores and sort
      const scoredProperties = allProperties.map(property => ({
        property,
        similarity: calculatePropertySimilarity(cleanQuery, property)
      }));

      scoredProperties.sort((a, b) => {
        if (searchOptions.prioritizeFeatured) {
          if (a.property.isFeatured && !b.property.isFeatured) return -1;
          if (!a.property.isFeatured && b.property.isFeatured) return 1;
        }
        return b.similarity - a.similarity;
      });

      properties = scoredProperties
        .slice(0, searchOptions.limit)
        .map(item => item.property);
    } else {
      // For other sorting methods, use Prisma's built-in sorting
      properties = await prisma.property.findMany({
        where,
        orderBy,
        take: searchOptions.limit,
        skip: searchOptions.offset
      });
    }

    // Increment view count for returned properties
    if (properties.length > 0) {
      await prisma.property.updateMany({
        where: {
          id: {
            in: properties.map(p => p.id)
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
      take: limit * 2 // Get more to calculate similarity
    });

    // Calculate similarity scores if we have a meaningful comparison
    if (similarProperties.length > 0) {
      const searchQuery = `${baseProperty.type} ${baseProperty.city} ${baseProperty.bedrooms} bedroom`;
      const scoredProperties = similarProperties.map(property => ({
        property,
        similarity: calculatePropertySimilarity(searchQuery, property)
      }));

      return scoredProperties
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(item => item.property);
    }

    return similarProperties.slice(0, limit);
  } catch (error) {
    console.error('Error getting similar properties:', error);
    return [];
  }
}

// Advanced search with multiple filters and faceted results
export async function advancedSearch(
  filters: SearchFilters,
  options: SearchOptions = {}
): Promise<{
  properties: Property[];
  totalCount: number;
  facets: {
    types: { type: PropertyType; count: number }[];
    cities: { city: string; count: number }[];
    priceRanges: { min: number; max: number; count: number }[];
  };
}> {
  try {
    const where = buildWhereClause(filters);
    
    // Get properties
    const properties = await prisma.property.findMany({
      where,
      orderBy: buildOrderByClause(options),
      take: options.limit || 10,
      skip: options.offset || 0
    });

    const totalCount = await prisma.property.count({ where });

    // Calculate facets for filtering
    const typeFacets = await prisma.property.groupBy({
      by: ['type'],
      where,
      _count: { type: true }
    });

    const cityFacets = await prisma.property.groupBy({
      by: ['city'],
      where,
      _count: { city: true },
      orderBy: { _count: { city: 'desc' } },
      take: 10
    });

    // Price range facets
    const priceRanges = [
      { min: 0, max: 100000 },
      { min: 100000, max: 300000 },
      { min: 300000, max: 500000 },
      { min: 500000, max: 1000000 },
      { min: 1000000, max: Infinity }
    ];

    const priceRangeFacets = await Promise.all(
      priceRanges.map(async (range) => {
        const count = await prisma.property.count({
          where: {
            ...where,
            price: {
              gte: range.min,
              lt: range.max === Infinity ? undefined : range.max
            }
          }
        });
        return { ...range, count };
      })
    );

    return {
      properties,
      totalCount,
      facets: {
        types: typeFacets.map(f => ({ type: f.type, count: f._count.type })),
        cities: cityFacets.map(f => ({ city: f.city, count: f._count.city })),
        priceRanges: priceRangeFacets.filter(f => f.count > 0)
      }
    };
  } catch (error) {
    console.error('Advanced search error:', error);
    throw error;
  }
}

// Utility function to parse search query and extract filters
export function parseSearchQuery(query: string): { cleanQuery: string; filters: SearchFilters } {
  const filters: SearchFilters = {};
  let cleanQuery = query.toLowerCase();
  
  // Extract price range
  const priceMatch = cleanQuery.match(/(\d+(?:,\d+)?)\s*[-–]\s*(\d+(?:,\d+)?)/);
  if (priceMatch) {
    filters.minPrice = parseFloat(priceMatch[1].replace(',', ''));
    filters.maxPrice = parseFloat(priceMatch[2].replace(',', ''));
    cleanQuery = cleanQuery.replace(priceMatch[0], '').trim();
  }
  
  // Extract bedroom count
  const bedroomMatch = cleanQuery.match(/(\d+)\s*(غرف|غرفة|bedroom|br|bed)/);
  if (bedroomMatch) {
    const bedrooms = parseInt(bedroomMatch[1]);
    filters.minBedrooms = bedrooms;
    filters.maxBedrooms = bedrooms;
    cleanQuery = cleanQuery.replace(bedroomMatch[0], '').trim();
  }
  
  // Extract bathroom count
  const bathroomMatch = cleanQuery.match(/(\d+)\s*(حمام|bathroom|bath|ba)/);
  if (bathroomMatch) {
    const bathrooms = parseInt(bathroomMatch[1]);
    filters.minBathrooms = bathrooms;
    filters.maxBathrooms = bathrooms;
    cleanQuery = cleanQuery.replace(bathroomMatch[0], '').trim();
  }
  
  // Extract property type
  const typeMatches: [RegExp, PropertyType][] = [
    [/(شقة|شقق|apartment|flat)/, PropertyType.APARTMENT],
    [/(فيلا|فلل|villa)/, PropertyType.VILLA],
    [/(تاون|townhouse)/, PropertyType.TOWNHOUSE],
    [/(بنتهاوس|penthouse)/, PropertyType.PENTHOUSE],
    [/(استوديو|studio)/, PropertyType.STUDIO],
    [/(مكتب|مكاتب|office)/, PropertyType.OFFICE],
    [/(محل|متجر|shop|store)/, PropertyType.SHOP],
    [/(مستودع|مخزن|warehouse)/, PropertyType.WAREHOUSE],
    [/(أرض|قطعة|land|plot)/, PropertyType.LAND],
    [/(مبنى|عمارة|building)/, PropertyType.BUILDING]
  ];
  
  for (const [regex, type] of typeMatches) {
    if (regex.test(cleanQuery)) {
      filters.type = type;
      cleanQuery = cleanQuery.replace(regex, '').trim();
      break;
    }
  }
  
  // Extract furnished status
  if (/(مفروش|مؤثث|furnished)/.test(cleanQuery)) {
    filters.furnished = true;
    cleanQuery = cleanQuery.replace(/(مفروش|مؤثث|furnished)/g, '').trim();
  }
  
  // Extract pet-friendly status
  if (/(حيوانات|pets?|pet.friendly)/.test(cleanQuery)) {
    filters.petFriendly = true;
    cleanQuery = cleanQuery.replace(/(حيوانات|pets?|pet.friendly)/g, '').trim();
  }
  
  // Extract parking requirement
  if (/(موقف|parking|garage)/.test(cleanQuery)) {
    filters.parking = true;
    cleanQuery = cleanQuery.replace(/(موقف|parking|garage)/g, '').trim();
  }
  
  return { cleanQuery: cleanQuery.trim(), filters };
}

// Get property recommendations based on user preferences
export async function getPropertyRecommendations(
  userId: string,
  limit: number = 10
): Promise<Property[]> {
  try {
    // This is a simplified recommendation system
    // In a real application, you would analyze user behavior, preferences, etc.
    
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