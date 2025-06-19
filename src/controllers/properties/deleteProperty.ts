import { prisma } from "../../lib/prisma";

const deleteProperty = async (id: string) => {
  const property = await prisma.property.delete({
    where: { id },
  });
  return property;
};

export default deleteProperty;