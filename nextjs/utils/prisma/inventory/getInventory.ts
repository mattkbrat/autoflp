import prisma from '@/lib/prisma';

const getInventory = async ({
  make,
  model,
  year,
  vin,
  state,
  deal,
}: {
  make?: string;
  model?: string;
  year?: string;
  vin?: string;
  state?: number;
  deal?: string;
}) => {
  return prisma.inventory.findMany({
    where: {
      make,
      model,
      year,
      vin,
      state,
      deals: {
        some: {
          id: deal,
        },
      },
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
