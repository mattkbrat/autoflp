import prisma from '@/lib/prisma';
import { Deal } from '@/types/prisma/deals';

const getCurrentDealsWithInventory = ({
  inventory,
  exclude,
}: {
  inventory: Deal['inventory_id'];
  exclude?: Deal['id'][];
}) => {
  if (!inventory) {
    throw 'Inventory is required';
  }

  return prisma.deal.findMany({
    where: {
      inventory_id: inventory,
      state: 1,
      id: {
        notIn: exclude,
      },
    },
  });
};

export default getCurrentDealsWithInventory;
