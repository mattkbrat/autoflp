import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const inventorySelect = {
  select: {
    id: true,
    make: true,
    model: true,
    year: true,
  },
};

const accountPersonSelect = {
  select: {
    id: true,
    person: {
      select: {
        first_name: true,
        last_name: true,
      },
    },
  },
};

const getDealPayments = async ({ deal }: { deal: string }) => {
  return prisma.deal.findUnique({
    where: {
      id: deal,
    },
    include: {
      dealCharges: {
        select: {
          charges: {
            select: {
              id: true,
              name: true,
              amount: true,
            },
          },
        },
      },
      payments: {
        select: {
          deal: true,
          date: true,
          amount: true,
          id: true,
        },
        orderBy: [
          {
            date: 'desc' as Prisma.SortOrder,
          },
          {
            amount: 'desc' as Prisma.SortOrder,
          },
        ],
      },
      dealTrades: {
        include: {
          inventory: inventorySelect,
        },
      },
      inventory: inventorySelect,
      Account: {
        select: {
          id: true,
          person: true,
        },
      },
    },
  });
};

export const getDealsWithPayments = async ({
  state,
  limit,
}: {
  state?: 0 | 1;
  limit?: number;
}) => {
  return prisma.deal.findMany({
    where: {
      state,
    },
    orderBy: {
      account: 'desc',
    },
    take: limit,
    include: {
      dealCharges: {
        select: {
          charges: {
            select: {
              id: true,
              name: true,
              amount: true,
            },
          },
        },
      },
      dealTrades: {
        include: {
          inventory: inventorySelect,
        },
      },
      inventory: inventorySelect,
      Account: {
        select: {
          id: true,
          person: true,
        },
      },
      payments: {
        select: {
          deal: true,
          date: true,
          amount: true,
          id: true,
        },
        orderBy: [
          {
            date: 'desc' as Prisma.SortOrder,
          },
          {
            amount: 'desc' as Prisma.SortOrder,
          },
        ],
      },
    },
  });
};

export default getDealPayments;
