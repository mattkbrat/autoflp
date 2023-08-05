import { Prisma } from '@prisma/client';

const defaultPaymentsSelect = {
    select: {
      date: true,
      amount: true,
      id: true,
    },
    orderBy: [
      {
        date: 'desc' as Prisma.SortOrder
      },
      {
        amount: 'desc' as Prisma.SortOrder
      },
    ],
  };

export default defaultPaymentsSelect;