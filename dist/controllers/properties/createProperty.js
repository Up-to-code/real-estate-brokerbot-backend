"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../lib/prisma");
const client_1 = require("@prisma/client");
const mapStatusToEnum = (status) => {
    const statusMap = {
        'مؤجر': client_1.PropertyStatus.RENTED,
        'متاح': client_1.PropertyStatus.AVAILABLE,
        'محجوز': client_1.PropertyStatus.RESERVED,
        'مباع': client_1.PropertyStatus.SOLD,
        'غير متاح': client_1.PropertyStatus.OFF_MARKET,
        'rented': client_1.PropertyStatus.RENTED,
        'available': client_1.PropertyStatus.AVAILABLE,
        'reserved': client_1.PropertyStatus.RESERVED,
        'sold': client_1.PropertyStatus.SOLD,
        'off market': client_1.PropertyStatus.OFF_MARKET,
    };
    const normalizedStatus = status?.toLowerCase();
    return statusMap[status] || statusMap[normalizedStatus] || client_1.PropertyStatus.AVAILABLE;
};
const createProperty = async (data) => {
    const propertyType = data.type?.toUpperCase();
    const propertyStatus = mapStatusToEnum(data.status);
    const property = await prisma_1.prisma.property.create({
        data: {
            title: data.title,
            description: data.description,
            price: parseFloat(data.price),
            currency: data.currency || "SA",
            type: propertyType,
            status: propertyStatus,
            bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
            bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
            area: data.area ? parseFloat(data.area) : null,
            location: data.location || data.address,
            address: data.address,
            city: data.city,
            country: data.country || "Saudi Arabia",
            latitude: data.latitude ? parseFloat(data.latitude) : null,
            longitude: data.longitude ? parseFloat(data.longitude) : null,
            images: data.images || [],
            features: data.features || [],
            amenities: data.amenities || [],
            yearBuilt: data.yearBuilt ? parseInt(data.yearBuilt) : null,
            parking: data.parking ? parseInt(data.parking) : null,
            furnished: data.furnished === "true" || data.furnished === true,
            petFriendly: data.petFriendly === "true" || data.petFriendly === true,
            utilities: data.utilities,
            contactInfo: data.contactInfo,
            agentId: data.agentId,
            isActive: data.isActive !== "false" && data.isActive !== false,
            isFeatured: data.isFeatured === "true" || data.isFeatured === true,
        },
    });
    return property;
};
exports.default = createProperty;
