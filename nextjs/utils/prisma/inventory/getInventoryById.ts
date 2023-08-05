import prisma from '@/lib/prisma';

const getInventoryById = async ({ id }: { id: string }) => {
  return prisma.inventory.findUnique({
    where: {
      id,
    },
  });
};

export default getInventoryById;
