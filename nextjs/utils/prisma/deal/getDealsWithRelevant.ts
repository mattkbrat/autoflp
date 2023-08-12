import prisma from '@/lib/prisma';

const getDealsWithRelevant = async ({
  state,
  id,
}: {
  state?: number;
  id?: string;
}) => {
  return prisma.deal.findMany({
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
      creditors: {
        include: {
          person: true,
        },
      },
      Account: {
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
      inventory: true,
      dealSalesmen: {
        select: {
          Salesman: {
            select: {
              salesmanPerson: {
                select: {
                  first_name: true,
                  last_name: true,
                },
              },
            },
          },
        },
      },
      dealTrades: {
        select: {
          value: true,
          vin: true,
          inventory: {
            select: {
              make: true,
              model: true,
              year: true,
            },
          },
        },
      },
    },
    where: {
      id,
      state,
    },
    orderBy: [
      {
        Account: {
          person: {
            last_name: 'asc',
          },
        },
      },
      {
        Account: {
          person: {
            first_name: 'asc',
          },
        },
      },
    ],
  });
};

export default getDealsWithRelevant;
