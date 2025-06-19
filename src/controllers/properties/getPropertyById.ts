import { prisma } from "../../lib/prisma";

const getPropertyById = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
  });
  return property;
};

export default getPropertyById;