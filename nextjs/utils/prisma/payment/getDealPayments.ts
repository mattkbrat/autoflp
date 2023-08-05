import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { Deal } from '@/types/prisma/deals';
import defaultPaymentsSelect from './defaultPaymentsSelect';

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
    person: {
      select: {
        first_name: true,
        last_name: true,
      }
    }    
  }
};



const getDealPayments = async ({ deal }: { deal: Deal['id'] }) => {
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
      payments: defaultPaymentsSelect,
      dealTrades: {
        select: {
          inventory: inventorySelect
        },
      },
      inventory: inventorySelect,
      accounts: accountPersonSelect,
    },
  });
};

export default getDealPayments;
