import prisma from '@/lib/prisma';

const getDealsByAccount = ({ accountId: account_id }: { accountId: string }) => {
  return prisma.deal.findMany({
    where: {
      account: {
        id: account_id,
      },
    },
    include: {
      account: {
        include: {
          person: true,
        },
      },
      salesmen: {
        select: {
          salesman: {
            select: {
              person: true,
            },
          },
        },
      },
      trades: {
        include: {
          inventory: true,
        },
      },
      inventory: true,
      creditor: {
        include: {
          person: true,
        },
      },
    },
  });
};

export default getDealsByAccount;
