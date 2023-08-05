import { Prisma } from '@prisma/client';

const accountPersonSelect = {
  select: {
    person: {
      select: {
        first_name: true,
        last_name: true,
      },
    },
  },
  orderBy: [
    {
      person: {
        first_name: 'asc' as Prisma.SortOrder,
      },
    },
    {
      person: {
        last_name: 'asc' as Prisma.SortOrder,
      },
    },
  ],
};

export default accountPersonSelect;
