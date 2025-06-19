import { prisma } from "../../lib/prisma";

// Simple service function with Prisma
const getProperties = async (filters: any, page: number, limit: number) => {
  const where: any = {};

  // City filter
  if (filters.city) {
    where.city = {
      contains: filters.city,
      mode: "insensitive",
    };
  }

  // Search filter
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { location: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  // Price range
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }

  // Type filter
  if (filters.type) {
    where.type = filters.type;
  }

  // Status filter
  if (filters.status) {
    where.status = filters.status;
  }

  // Active filter
  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.count({ where }),
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

export default getProperties;
