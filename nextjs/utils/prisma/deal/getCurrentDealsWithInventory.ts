import prisma from '@/lib/prisma';
import { Deal } from '@/types/prisma/deals';
import { Prisma } from '@prisma/client';

const getCurrentDealsWithInventory = ({
  inventory,
  exclude,
}: {
  inventory: Deal['inventoryId'];
  exclude?: string[];
}) => {
  if (!inventory) {
    throw 'Inventory is required';
  }

  return prisma.deal.findMany({
    where: {
      inventoryId: inventory,
      state: 1,
      id: {
        notIn: exclude,
      },
    },
  });
};

export default getCurrentDealsWithInventory;
