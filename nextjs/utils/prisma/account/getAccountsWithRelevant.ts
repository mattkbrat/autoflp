import prisma from '@/lib/prisma';

const getAccountsWithRelevant = () => {
  return prisma.account.findMany({
    include: {
      person: true,
      deal_deal_accountToaccount: {
        include: {
          creditors: {
            select: {
              id: true,
              person: true,
            }
          },
          inventory: true,
        },
      },
    },
  });
};

export default getAccountsWithRelevant;
