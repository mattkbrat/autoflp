import prisma from '@/lib/prisma';
import { Deal } from '@/types/prisma/deals';

const getDealsWithRelevant = async ({
  state,
  id,
}: {
  state?: number;
  id?: string;
}) => {
  return prisma.deal.findMany({
    select: {
      id: true,
      account_id: true,
      date: true,
      account: {
        include: {
          person: {
            select: {
              first_name: true,
              last_name: true,
              middle_initial: true,
              name_suffix: true,
              name_prefix: true,
              id: true,
              phone_primary: true,
              email_primary: true,
            },
          },
        },
      },
      // payment: true,
      inventory: {
        select: {
          make: true,
          model: true,
          year: true,
          vin: true,
          id: true,
        },
      },
    },
    where: {
      id,
      state,
    },
    orderBy: [
      {
        account: {
          person: {
            last_name: 'asc',
          },
        },
      },
      {
        account: {
          person: {
            first_name: 'asc',
          },
        },
      },
    ],
  }) as Promise<
    {
      id: string;
      account_id: string;
      date: string;
      account: {
        person: {
          first_name: string;
          last_name: string;
          middle_initial: string;
          name_suffix: string;
          name_prefix: string;
          id: string;
          phone_primary: string;
          email_primary: string;
        };
      };
      inventory: {
        make: string;
        model: string;
        year: string;
        vin: string;
        id: string;
      };
    }[]
  >;
};

export default getDealsWithRelevant;
