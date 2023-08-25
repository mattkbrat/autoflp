import prisma from '@/lib/prisma';

const getInventoryByIdWithDeals = async ({
  inventoryId,
}: {
  inventoryId: string;
}) => {
  return prisma.inventory.findUnique({
    where: {
      id: inventoryId,
    },
    include: {
      deal: {
        include: {
          Account: {
            include: {
              person: true,
            },
          },
          creditors: {
            include: {
              person: true,
            },
          },
        },
      },
    },
  });
};

export default getInventoryByIdWithDeals;
