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
      deals: {
        include: {
          account: {
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
