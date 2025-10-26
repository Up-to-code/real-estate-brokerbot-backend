"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNaturalLanguageQuery = parseNaturalLanguageQuery;
exports.searchProperties = searchProperties;
exports.getSimilarProperties = getSimilarProperties;
exports.getPropertyRecommendations = getPropertyRecommendations;
exports.getTrendingProperties = getTrendingProperties;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../../lib/prisma");
function isValidValue(value) {
    return value !== null && value !== undefined;
}
function normalizeText(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[\u064B-\u0652]/g, '')
        .replace(/[.,!?;:()\-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function extractTokens(text) {
    const normalized = normalizeText(text);
    return normalized.split(/\s+/).filter(token => token.length > 1);
}
function calculateStringSimilarity(str1, str2) {
    if (!str1 || !str2)
        return 0;
    const normalized1 = normalizeText(str1);
    const normalized2 = normalizeText(str2);
    if (normalized1 === normalized2)
        return 1;
    const distance = calculateLevenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
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
function mapToPropertyType(input) {
    if (!input)
        return undefined;
    const normalized = normalizeText(input);
    const typeMap = {
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
function buildWhereClause(filters, searchQuery) {
    const where = {};
    const priceConditions = {};
    if (isValidValue(filters.minPrice)) {
        priceConditions.gte = filters.minPrice;
    }
    if (isValidValue(filters.maxPrice)) {
        priceConditions.lte = filters.maxPrice;
    }
    if (Object.keys(priceConditions).length > 0) {
        where.price = priceConditions;
    }
    if (filters.type)
        where.type = filters.type;
    if (filters.status)
        where.status = filters.status;
    if (filters.city)
        where.city = { contains: filters.city, mode: 'insensitive' };
    if (filters.country)
        where.country = { contains: filters.country, mode: 'insensitive' };
    const bedroomConditions = {};
    if (isValidValue(filters.minBedrooms)) {
        bedroomConditions.gte = filters.minBedrooms;
    }
    if (isValidValue(filters.maxBedrooms)) {
        bedroomConditions.lte = filters.maxBedrooms;
    }
    if (Object.keys(bedroomConditions).length > 0) {
        where.bedrooms = bedroomConditions;
    }
    const bathroomConditions = {};
    if (isValidValue(filters.minBathrooms)) {
        bathroomConditions.gte = filters.minBathrooms;
    }
    if (isValidValue(filters.maxBathrooms)) {
        bathroomConditions.lte = filters.maxBathrooms;
    }
    if (Object.keys(bathroomConditions).length > 0) {
        where.bathrooms = bathroomConditions;
    }
    const areaConditions = {};
    if (isValidValue(filters.minArea)) {
        areaConditions.gte = filters.minArea;
    }
    if (isValidValue(filters.maxArea)) {
        areaConditions.lte = filters.maxArea;
    }
    if (Object.keys(areaConditions).length > 0) {
        where.area = areaConditions;
    }
    if (isValidValue(filters.minParking)) {
        where.parking = { gte: filters.minParking };
    }
    else if (filters.parking !== undefined) {
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
    if (isValidValue(filters.yearBuilt)) {
        where.yearBuilt = filters.yearBuilt;
    }
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
function parseSearchQuery(query) {
    const filters = {};
    let cleanQuery = '';
    if (typeof query === 'string') {
        cleanQuery = query;
    }
    else if (typeof query === 'object' && query !== null) {
        const fieldMap = [
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
            }
            else if (key !== 'type' && isValidValue(value)) {
                filters[key] = value;
            }
        }
        const textFields = ['title', 'description', 'location', 'address'];
        const textParts = [];
        for (const field of textFields) {
            if (query[field] && typeof query[field] === 'string') {
                textParts.push(query[field]);
            }
        }
        cleanQuery = textParts.join(' ');
        if (query.district && typeof query.district === 'string' && !filters.city) {
            filters.city = query.district;
        }
    }
    if (cleanQuery && typeof cleanQuery === 'string') {
        const parsed = parseNaturalLanguageQuery(cleanQuery);
        return {
            cleanQuery: parsed.cleanQuery,
            filters: { ...filters, ...parsed.filters }
        };
    }
    return { cleanQuery: cleanQuery.trim(), filters };
}
function parseNaturalLanguageQuery(query) {
    const filters = {};
    let cleanQuery = normalizeText(query);
    const typeMatches = [
        [/(شقة|شقق|apartment|flat)/i, client_1.PropertyType.APARTMENT],
        [/(فيلا|فلل|villa)/i, client_1.PropertyType.VILLA],
        [/(تاون|townhouse)/i, client_1.PropertyType.TOWNHOUSE],
        [/(بنتهاوس|penthouse)/i, client_1.PropertyType.PENTHOUSE],
        [/(استوديو|studio)/i, client_1.PropertyType.STUDIO],
        [/(مكتب|مكاتب|office)/i, client_1.PropertyType.OFFICE],
        [/(محل|متجر|shop|store)/i, client_1.PropertyType.SHOP],
        [/(مستودع|مخزن|warehouse)/i, client_1.PropertyType.WAREHOUSE],
        [/(أرض|قطعة|land|plot)/i, client_1.PropertyType.LAND],
        [/(مبنى|عمارة|building)/i, client_1.PropertyType.BUILDING]
    ];
    for (const [regex, type] of typeMatches) {
        if (regex.test(cleanQuery)) {
            filters.type = type;
            cleanQuery = cleanQuery.replace(regex, '').trim();
            break;
        }
    }
    const locationMatches = [
        [/(أبحر الشمالية|abhar al shamaliyah)/i, 'أبحر الشمالية'],
        [/(أبحر الجنوبية|abhar al janubiyah)/i, 'أبحر الجنوبية'],
        [/(أبحره|أبحر|abhar)/i, 'أبحر الشمالية'],
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
    const priceMatch = cleanQuery.match(/(\d+(?:,\d+)?)\s*[-–]\s*(\d+(?:,\d+)?)/);
    if (priceMatch) {
        const minPrice = parseFloat(priceMatch[1].replace(',', ''));
        const maxPrice = parseFloat(priceMatch[2].replace(',', ''));
        if (!isNaN(minPrice))
            filters.minPrice = minPrice;
        if (!isNaN(maxPrice))
            filters.maxPrice = maxPrice;
        cleanQuery = cleanQuery.replace(priceMatch[0], '').trim();
    }
    const bedroomMatch = cleanQuery.match(/(\d+)\s*(غرف|غرفة|bedroom|br|bed)/i);
    if (bedroomMatch) {
        const bedrooms = parseInt(bedroomMatch[1]);
        if (!isNaN(bedrooms)) {
            filters.minBedrooms = bedrooms;
            filters.maxBedrooms = bedrooms;
        }
        cleanQuery = cleanQuery.replace(bedroomMatch[0], '').trim();
    }
    const bathroomMatch = cleanQuery.match(/(\d+)\s*(حمام|bathroom|bath|ba)/i);
    if (bathroomMatch) {
        const bathrooms = parseInt(bathroomMatch[1]);
        if (!isNaN(bathrooms)) {
            filters.minBathrooms = bathrooms;
            filters.maxBathrooms = bathrooms;
        }
        cleanQuery = cleanQuery.replace(bathroomMatch[0], '').trim();
    }
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
async function searchProperties(query, filters = {}, options = {}) {
    try {
        console.log('🔍 Search input:', { query, filters, options });
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
        const { cleanQuery, filters: queryFilters } = parseSearchQuery(query);
        const mergedFilters = { ...filters, ...queryFilters };
        console.log('🔍 Parsed query:', { cleanQuery, queryFilters, mergedFilters });
        const where = buildWhereClause(mergedFilters, cleanQuery);
        const orderBy = buildOrderByClause(searchOptions);
        console.log('🔍 Prisma where clause:', JSON.stringify(where, null, 2));
        const totalCount = await prisma_1.prisma.property.count({ where });
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
        const properties = await prisma_1.prisma.property.findMany({
            where,
            orderBy,
            take: searchOptions.limit,
            skip: searchOptions.offset
        });
        console.log('🔍 Found properties:', properties.length);
        if (properties.length > 0) {
            await prisma_1.prisma.property.updateMany({
                where: {
                    id: {
                        in: properties.map((p) => p.id)
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
            take: limit
        });
        return similarProperties;
    }
    catch (error) {
        console.error('Error getting similar properties:', error);
        return [];
    }
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
