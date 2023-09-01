import prisma from '@/lib/prisma';

const getInventoryByIdWithDeals = async ({
  inventoryId,
  vin
}: {
  inventoryId?: string;
  vin?: string;
}) => {
  return prisma.inventory.findUnique({
    where: inventoryId ? {
      id: inventoryId,
    } : {
      vin: vin,
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
