"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../lib/prisma");
const getProperties = async (filters, page, limit) => {
    const where = {};
    if (filters.city) {
        where.city = {
            contains: filters.city,
            mode: "insensitive",
        };
    }
    if (filters.search) {
        where.OR = [
            { title: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
            { location: { contains: filters.search, mode: "insensitive" } },
        ];
    }
    if (filters.minPrice || filters.maxPrice) {
        where.price = {};
        if (filters.minPrice)
            where.price.gte = filters.minPrice;
        if (filters.maxPrice)
            where.price.lte = filters.maxPrice;
    }
    if (filters.type) {
        where.type = filters.type;
    }
    if (filters.status) {
        where.status = filters.status;
    }
    if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
    }
    const [properties, total] = await Promise.all([
        prisma_1.prisma.property.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma_1.prisma.property.count({ where }),
    ]);
    return {
        properties,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
};
exports.default = getProperties;
