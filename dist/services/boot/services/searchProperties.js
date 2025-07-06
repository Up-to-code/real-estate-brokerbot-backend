"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProperties = searchProperties;
exports.getSimilarProperties = getSimilarProperties;
exports.advancedSearch = advancedSearch;
exports.parseSearchQuery = parseSearchQuery;
exports.getPropertyRecommendations = getPropertyRecommendations;
exports.getTrendingProperties = getTrendingProperties;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../../lib/prisma");
function normalizeText(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[\u064B-\u0652]/g, '')
        .replace(/\s+/g, ' ')
        .replace(/[.,!?;:()\-]/g, ' ')
        .trim();
}
function extractTokens(text) {
    const normalized = normalizeText(text);
    return normalized.split(/\s+/).filter(token => token.length > 1);
}
function extractPropertyContent(property) {
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
    const descriptiveTerms = [];
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
    const typeTranslations = {
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
function calculateJaccardSimilarity(tokens1, tokens2) {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    const intersection = new Set([...set1].filter(token => set2.has(token)));
    const union = new Set([...set1, ...set2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
}
function calculateCosineSimilarity(tokens1, tokens2) {
    const tf1 = createTermFrequencyMap(tokens1);
    const tf2 = createTermFrequencyMap(tokens2);
    const allTerms = new Set([...Object.keys(tf1), ...Object.keys(tf2)]);
    if (allTerms.size === 0)
        return 0;
    const vector1 = [];
    const vector2 = [];
    allTerms.forEach(term => {
        vector1.push(tf1[term] || 0);
        vector2.push(tf2[term] || 0);
    });
    const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
    return magnitude1 === 0 || magnitude2 === 0 ? 0 : dotProduct / (magnitude1 * magnitude2);
}
function createTermFrequencyMap(tokens) {
    const tfMap = {};
    tokens.forEach(token => {
        tfMap[token] = (tfMap[token] || 0) + 1;
    });
    return tfMap;
}
function calculateLevenshteinDistance(str1, str2) {
    const matrix = [];
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
            }
            else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            }
        }
    }
    return matrix[str2.length][str1.length];
}
function levenshteinToSimilarity(str1, str2) {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0)
        return 1;
    const distance = calculateLevenshteinDistance(str1, str2);
    return (maxLength - distance) / maxLength;
}
function buildWhereClause(filters, query) {
    const where = {};
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        where.price = {};
        if (filters.minPrice !== undefined)
            where.price.gte = filters.minPrice;
        if (filters.maxPrice !== undefined)
            where.price.lte = filters.maxPrice;
    }
    if (filters.type)
        where.type = filters.type;
    if (filters.status)
        where.status = filters.status;
    if (filters.city)
        where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.country)
        where.country = { contains: filters.country, mode: 'insensitive' };
    if (filters.minBedrooms !== undefined || filters.maxBedrooms !== undefined) {
        where.bedrooms = {};
        if (filters.minBedrooms !== undefined)
            where.bedrooms.gte = filters.minBedrooms;
        if (filters.maxBedrooms !== undefined)
            where.bedrooms.lte = filters.maxBedrooms;
    }
    if (filters.minBathrooms !== undefined || filters.maxBathrooms !== undefined) {
        where.bathrooms = {};
        if (filters.minBathrooms !== undefined)
            where.bathrooms.gte = filters.minBathrooms;
        if (filters.maxBathrooms !== undefined)
            where.bathrooms.lte = filters.maxBathrooms;
    }
    if (filters.minArea !== undefined || filters.maxArea !== undefined) {
        where.area = {};
        if (filters.minArea !== undefined)
            where.area.gte = filters.minArea;
        if (filters.maxArea !== undefined)
            where.area.lte = filters.maxArea;
    }
    if (filters.minParking !== undefined) {
        where.parking = { gte: filters.minParking };
    }
    if (filters.parking !== undefined) {
        where.parking = filters.parking ? { gt: 0 } : { lte: 0 };
    }
    if (filters.furnished !== undefined)
        where.furnished = filters.furnished;
    if (filters.petFriendly !== undefined)
        where.petFriendly = filters.petFriendly;
    if (filters.isActive !== undefined)
        where.isActive = filters.isActive;
    if (filters.isFeatured !== undefined)
        where.isFeatured = filters.isFeatured;
    if (filters.agentId)
        where.agentId = filters.agentId;
    if (filters.yearBuilt)
        where.yearBuilt = filters.yearBuilt;
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
function buildOrderByClause(options) {
    const orderBy = [];
    if (options.prioritizeFeatured) {
        orderBy.push({ isFeatured: 'desc' });
    }
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
    }
    else {
        orderBy.push({ createdAt: 'desc' });
    }
    return orderBy;
}
function calculatePropertySimilarity(query, property) {
    const queryTokens = extractTokens(query);
    const propertyContent = extractPropertyContent(property);
    const propertyTokens = extractTokens(propertyContent);
    const jaccardScore = calculateJaccardSimilarity(queryTokens, propertyTokens);
    const cosineScore = calculateCosineSimilarity(queryTokens, propertyTokens);
    const titleSimilarity = levenshteinToSimilarity(normalizeText(query), normalizeText(property.title));
    const descriptionSimilarity = levenshteinToSimilarity(normalizeText(query), normalizeText(property.description));
    const locationSimilarity = levenshteinToSimilarity(normalizeText(query), normalizeText(`${property.location} ${property.city}`));
    let combinedScore = (jaccardScore * 0.25 +
        cosineScore * 0.25 +
        titleSimilarity * 0.25 +
        descriptionSimilarity * 0.15 +
        locationSimilarity * 0.10);
    if (property.isFeatured) {
        combinedScore *= 1.05;
    }
    if (property.isActive) {
        combinedScore *= 1.02;
    }
    return Math.min(combinedScore, 1.0);
}
async function searchProperties(query, filters = {}, options = {}) {
    try {
        const searchOptions = {
            limit: 10,
            offset: 0,
            includeInactive: false,
            prioritizeFeatured: true,
            sortBy: 'relevance',
            sortOrder: 'desc',
            ...options
        };
        if (!searchOptions.includeInactive) {
            filters.isActive = true;
        }
        const { cleanQuery, filters: parsedFilters } = parseSearchQuery(query);
        const combinedFilters = { ...filters, ...parsedFilters };
        const where = buildWhereClause(combinedFilters, cleanQuery);
        const orderBy = buildOrderByClause(searchOptions);
        const totalCount = await prisma_1.prisma.property.count({ where });
        if (totalCount === 0) {
            return {
                properties: [],
                totalCount: 0,
                message: "معذرة، لا توجد عقارات تطابق معايير البحث. / Sorry, no properties match the search criteria.",
                hasMore: false
            };
        }
        let properties;
        if (searchOptions.sortBy === 'relevance' && cleanQuery.trim()) {
            const allProperties = await prisma_1.prisma.property.findMany({
                where,
                take: Math.min(totalCount, 100),
                skip: searchOptions.offset
            });
            const scoredProperties = allProperties.map(property => ({
                property,
                similarity: calculatePropertySimilarity(cleanQuery, property)
            }));
            scoredProperties.sort((a, b) => {
                if (searchOptions.prioritizeFeatured) {
                    if (a.property.isFeatured && !b.property.isFeatured)
                        return -1;
                    if (!a.property.isFeatured && b.property.isFeatured)
                        return 1;
                }
                return b.similarity - a.similarity;
            });
            properties = scoredProperties
                .slice(0, searchOptions.limit)
                .map(item => item.property);
        }
        else {
            properties = await prisma_1.prisma.property.findMany({
                where,
                orderBy,
                take: searchOptions.limit,
                skip: searchOptions.offset
            });
        }
        if (properties.length > 0) {
            await prisma_1.prisma.property.updateMany({
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
    }
    catch (error) {
        console.error('Search error:', error);
        return {
            properties: [],
            totalCount: 0,
            message: "حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى. / An error occurred during search. Please try again.",
            hasMore: false
        };
    }
}
async function getSimilarProperties(propertyId, limit = 5) {
    try {
        const baseProperty = await prisma_1.prisma.property.findUnique({
            where: { id: propertyId }
        });
        if (!baseProperty) {
            return [];
        }
        const priceRange = baseProperty.price * 0.3;
        const where = {
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
        const similarProperties = await prisma_1.prisma.property.findMany({
            where,
            orderBy: [
                { isFeatured: 'desc' },
                { viewCount: 'desc' },
                { createdAt: 'desc' }
            ],
            take: limit * 2
        });
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
    }
    catch (error) {
        console.error('Error getting similar properties:', error);
        return [];
    }
}
async function advancedSearch(filters, options = {}) {
    try {
        const where = buildWhereClause(filters);
        const properties = await prisma_1.prisma.property.findMany({
            where,
            orderBy: buildOrderByClause(options),
            take: options.limit || 10,
            skip: options.offset || 0
        });
        const totalCount = await prisma_1.prisma.property.count({ where });
        const typeFacets = await prisma_1.prisma.property.groupBy({
            by: ['type'],
            where,
            _count: { type: true }
        });
        const cityFacets = await prisma_1.prisma.property.groupBy({
            by: ['city'],
            where,
            _count: { city: true },
            orderBy: { _count: { city: 'desc' } },
            take: 10
        });
        const priceRanges = [
            { min: 0, max: 100000 },
            { min: 100000, max: 300000 },
            { min: 300000, max: 500000 },
            { min: 500000, max: 1000000 },
            { min: 1000000, max: Infinity }
        ];
        const priceRangeFacets = await Promise.all(priceRanges.map(async (range) => {
            const count = await prisma_1.prisma.property.count({
                where: {
                    ...where,
                    price: {
                        gte: range.min,
                        lt: range.max === Infinity ? undefined : range.max
                    }
                }
            });
            return { ...range, count };
        }));
        return {
            properties,
            totalCount,
            facets: {
                types: typeFacets.map(f => ({ type: f.type, count: f._count.type })),
                cities: cityFacets.map(f => ({ city: f.city, count: f._count.city })),
                priceRanges: priceRangeFacets.filter(f => f.count > 0)
            }
        };
    }
    catch (error) {
        console.error('Advanced search error:', error);
        throw error;
    }
}
function parseSearchQuery(query) {
    const filters = {};
    let cleanQuery = query.toLowerCase();
    const priceMatch = cleanQuery.match(/(\d+(?:,\d+)?)\s*[-–]\s*(\d+(?:,\d+)?)/);
    if (priceMatch) {
        filters.minPrice = parseFloat(priceMatch[1].replace(',', ''));
        filters.maxPrice = parseFloat(priceMatch[2].replace(',', ''));
        cleanQuery = cleanQuery.replace(priceMatch[0], '').trim();
    }
    const bedroomMatch = cleanQuery.match(/(\d+)\s*(غرف|غرفة|bedroom|br|bed)/);
    if (bedroomMatch) {
        const bedrooms = parseInt(bedroomMatch[1]);
        filters.minBedrooms = bedrooms;
        filters.maxBedrooms = bedrooms;
        cleanQuery = cleanQuery.replace(bedroomMatch[0], '').trim();
    }
    const bathroomMatch = cleanQuery.match(/(\d+)\s*(حمام|bathroom|bath|ba)/);
    if (bathroomMatch) {
        const bathrooms = parseInt(bathroomMatch[1]);
        filters.minBathrooms = bathrooms;
        filters.maxBathrooms = bathrooms;
        cleanQuery = cleanQuery.replace(bathroomMatch[0], '').trim();
    }
    const typeMatches = [
        [/(شقة|شقق|apartment|flat)/, client_1.PropertyType.APARTMENT],
        [/(فيلا|فلل|villa)/, client_1.PropertyType.VILLA],
        [/(تاون|townhouse)/, client_1.PropertyType.TOWNHOUSE],
        [/(بنتهاوس|penthouse)/, client_1.PropertyType.PENTHOUSE],
        [/(استوديو|studio)/, client_1.PropertyType.STUDIO],
        [/(مكتب|مكاتب|office)/, client_1.PropertyType.OFFICE],
        [/(محل|متجر|shop|store)/, client_1.PropertyType.SHOP],
        [/(مستودع|مخزن|warehouse)/, client_1.PropertyType.WAREHOUSE],
        [/(أرض|قطعة|land|plot)/, client_1.PropertyType.LAND],
        [/(مبنى|عمارة|building)/, client_1.PropertyType.BUILDING]
    ];
    for (const [regex, type] of typeMatches) {
        if (regex.test(cleanQuery)) {
            filters.type = type;
            cleanQuery = cleanQuery.replace(regex, '').trim();
            break;
        }
    }
    if (/(مفروش|مؤثث|furnished)/.test(cleanQuery)) {
        filters.furnished = true;
        cleanQuery = cleanQuery.replace(/(مفروش|مؤثث|furnished)/g, '').trim();
    }
    if (/(حيوانات|pets?|pet.friendly)/.test(cleanQuery)) {
        filters.petFriendly = true;
        cleanQuery = cleanQuery.replace(/(حيوانات|pets?|pet.friendly)/g, '').trim();
    }
    if (/(موقف|parking|garage)/.test(cleanQuery)) {
        filters.parking = true;
        cleanQuery = cleanQuery.replace(/(موقف|parking|garage)/g, '').trim();
    }
    return { cleanQuery: cleanQuery.trim(), filters };
}
async function getPropertyRecommendations(userId, limit = 10) {
    try {
        return await prisma_1.prisma.property.findMany({
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
    }
    catch (error) {
        console.error('Error getting recommendations:', error);
        return [];
    }
}
async function getTrendingProperties(limit = 10) {
    try {
        return await prisma_1.prisma.property.findMany({
            where: {
                isActive: true,
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            },
            orderBy: [
                { viewCount: 'desc' },
                { isFeatured: 'desc' }
            ],
            take: limit
        });
    }
    catch (error) {
        console.error('Error getting trending properties:', error);
        return [];
    }
}
