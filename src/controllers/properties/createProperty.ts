import { prisma } from "../../lib/prisma";


 
// Create property function
const createProperty = async (data: any) => {
  const property = await prisma.property.create({
    data: {
      title: data.title,
      description: data.description,
      price: parseFloat(data.price),
      currency: data.currency || "SA",
      type: data.type,
      status: data.status || "For Sale",
      bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
      bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
      area: data.area ? parseFloat(data.area) : null,
      location: data.location,
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
