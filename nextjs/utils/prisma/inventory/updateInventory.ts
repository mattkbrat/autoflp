import { Prisma } from '@prisma/client';
import { createInventory } from '@/utils/prisma/inventory/index';
import { Inventory } from '@/types/prisma/inventory';
const updateInventory = async (id: string, data: Partial<Inventory>) => {
  const { vin, make, year } = data;

  if (typeof vin !== 'string' || vin.length !== 17 || !vin) {
    throw new Error('VIN is required');
  }

  if (typeof make !== 'string' || typeof year !== 'string') {
    throw new Error('Make and year are required');
  }

  return createInventory({
    inventory: {
      ...data,
      vin,
      make,
      year,
      id,
    },
  });
};

export default updateInventory;
