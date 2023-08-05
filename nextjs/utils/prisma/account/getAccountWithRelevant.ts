import prisma from '@/lib/prisma';

const getAccountWithRelevant = ({ id }: { id: string }) => {
  return prisma.account.findUnique({
    where: {
      id,
    },
    include: {
      person: true,
      deal_deal_accountToaccount: {
        include: {
          creditors: true,
          inventory: true,
          dealSalesmen: {
            include: {Salesman: true}
          },
        },
      },
    },
  });
};

export default getAccountWithRelevant;
