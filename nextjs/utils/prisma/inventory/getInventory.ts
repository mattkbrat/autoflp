import prisma from '@/lib/prisma';

const getInventory = async ({
  make,
  model,
  year,
  vin,
  state,
  deal,
}: {
  make?: string | string[];
  model?: string | string[];
  year?: string | string[];
  vin?: string | string[];
  state?: number | number[];
  deal?: string;
}) => {
  return prisma.inventory.findMany({
    where: {
      make: typeof make === 'string' ? make : {
        in: make,
      },
      model: typeof model === 'string' ? model : {
        in: model,
      },
      year: typeof year === 'string' ? year : {
        in: year,
      },
      vin: typeof vin === 'string' ? vin : {
        in: vin,
      },
      state: typeof state === 'number' ? state : {
        in: state,
      },
      deal: {
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
