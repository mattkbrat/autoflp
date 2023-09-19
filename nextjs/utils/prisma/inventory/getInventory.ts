import prisma from '@/lib/prisma';

const getInventory = async ({
  id,
  make,
  model,
  year,
  vin,
  state,
  deal,
}: {
  id?: string | string[];
  make?: string | string[];
  model?: string | string[];
  year?: string | string[];
  vin?: string | string[];
  state?: number | number[];
  deal?: string | string[];
}) => {
  return prisma.inventory.findMany({
    where: {
      id: Array.isArray(id) ? { in: id } : id,
      make: Array.isArray(make) ? { in: make } : make,
      model: Array.isArray(model) ? { in: model } : model,
      year: Array.isArray(year) ? { in: year } : year,
      vin: Array.isArray(vin) ? { in: vin } : vin,
      state: Array.isArray(state) ? { in: state } : state,
    },
    orderBy: [
      {
        make: 'asc',
      },
      {
        model: 'asc',
      },
      {
        body: 'asc',
      },
    ],
  });
};

export default getInventory;
