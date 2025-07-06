import { Property, PropertyType, PropertyStatus } from '@prisma/client';
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
export declare function searchProperties(query: string, filters?: SearchFilters, options?: SearchOptions): Promise<SearchResult>;
export declare function getSimilarProperties(propertyId: string, limit?: number): Promise<Property[]>;
export declare function advancedSearch(filters: SearchFilters, options?: SearchOptions): Promise<{
    properties: Property[];
    totalCount: number;
    facets: {
        types: {
            type: PropertyType;
            count: number;
        }[];
        cities: {
            city: string;
            count: number;
        }[];
        priceRanges: {
            min: number;
            max: number;
            count: number;
        }[];
    };
}>;
export declare function parseSearchQuery(query: string): {
    cleanQuery: string;
    filters: SearchFilters;
};
export declare function getPropertyRecommendations(userId: string, limit?: number): Promise<Property[]>;
export declare function getTrendingProperties(limit?: number): Promise<Property[]>;
export {};
