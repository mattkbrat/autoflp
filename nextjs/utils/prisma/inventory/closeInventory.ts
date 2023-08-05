import prisma from '@/lib/prisma';
import notifyInventory from '@/utils/pushover/inventory';
import formatInventory from '@/utils/format/formatInventory';

const closeInventory = async ({ id, vin }: { id?: string; vin?: string }) => {
  if (!id && !vin) {
    throw new Error('Must provide either id or vin');
  }

  return prisma.inventory
    .update({
      where: id
        ? {
            id,
          }
        : { vin },
      data: {
        state: 0,
      },
    })
    .then(async (res) => {
      await notifyInventory({
        inventory: formatInventory(res),
        id: res.id,
        type: 'DELETE',
      });
      return res;
    });
};

export default closeInventory;
