import { prisma } from "../../lib/prisma";

const updateProperty = async (id: string, data: any) => {
  const property = await prisma.property.update({
    where: { id },
    data,
  });
  return property;
};

export default updateProperty;