import prisma from '@/lib/prisma';
import { Deal } from '@/types/prisma/deals';
import defaultPaymentsSelect from './defaultPaymentsSelect';
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
  return prisma.deal.findFirst({
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
      Account: accountPersonSelect,
    },
  });
};

export default getDealPayments;
