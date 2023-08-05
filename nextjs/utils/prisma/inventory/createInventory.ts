import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import notifyInventory from '@/utils/pushover/inventory';
import formatInventory from '@/utils/format/formatInventory';
import { Inventory } from '@/types/prisma/inventory';

const createInventory = async ({ inventory }: { inventory: Inventory }) => {
  if (!inventory || !inventory.vin) {
    throw new Error('VIN is required');
  }

  const id = randomUUID();

  return prisma.inventory
    .upsert({
      where: {
        vin: inventory.vin,
      },
      update: {
        ...inventory,
      },
      create: {
        ...inventory,
        id,
      },
    })
    .then(async (res) => {
      await notifyInventory({
        inventory: formatInventory(res),
        id: res.id,
        type: res.id === id ? 'CREATE' : 'UPDATE',
      });
      return res;
    });
};

export default createInventory;
