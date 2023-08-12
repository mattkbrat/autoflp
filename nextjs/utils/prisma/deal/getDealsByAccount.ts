import prisma from '@/lib/prisma';

const getDealsByAccount = ({ accountId: account_id }: { accountId: string }) => {
  return prisma.deal.findMany({
    where: {
      Account: {
        id: account_id,
      },
    },
    include: {
      Account: {
        include: {
          person: true,
        },
      },
      dealSalesmen: {
        select: {
          Salesman: {
            select: {
              person: true,
            },
          },
        },
      },
      dealTrades: {
        include: {
          inventory: true,
        },
      },
      inventory: true,
      creditors: {
        include: {
          person: true,
        },
      },
    },
  });
};

export default getDealsByAccount;
