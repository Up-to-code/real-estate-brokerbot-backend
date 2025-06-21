import { prisma } from "../../lib/prisma";
import { PropertyType, PropertyStatus } from "@prisma/client";

// Helper function to map Arabic status to PropertyStatus enum
const mapStatusToEnum = (status: string): PropertyStatus => {
  const statusMap: Record<string, PropertyStatus> = {
    'مؤجر': PropertyStatus.RENTED,
    'متاح': PropertyStatus.AVAILABLE,
    'محجوز': PropertyStatus.RESERVED,
    'مباع': PropertyStatus.SOLD,
    'غير متاح': PropertyStatus.OFF_MARKET,
    // English mappings
    'rented': PropertyStatus.RENTED,
    'available': PropertyStatus.AVAILABLE,
    'reserved': PropertyStatus.RESERVED,
    'sold': PropertyStatus.SOLD,
    'off market': PropertyStatus.OFF_MARKET,
  };

  const normalizedStatus = status?.toLowerCase();
  return statusMap[status] || statusMap[normalizedStatus] || PropertyStatus.AVAILABLE;
};

// Create property function
const createProperty = async (data: any) => {
  // Convert type to uppercase to match enum
  const propertyType = data.type?.toUpperCase() as PropertyType;
  
  // Map status to enum value
  const propertyStatus = mapStatusToEnum(data.status);

  const property = await prisma.property.create({
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

export default createProperty;
