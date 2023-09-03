import prisma from '@/lib/prisma';

const getAccountWithRelevant = ({
  id,
  dealId,
}: {
  id?: string;
  dealId?: string;
}) => {
  if (!id) throw new Error('No id provided');

  return prisma.account.findUnique({
    where: {
      id,
      deal_deal_accountToaccount: dealId
        ? {
            some: {
              id: dealId,
            },
          }
        : undefined,
    },
    include: {
      person: true,
      deal_deal_accountToaccount: {
        include: {
          creditors: true,
          inventory: true,
          dealSalesmen: {
            include: { Salesman: true },
          },
        },
      },
    },
  });
};

export default getAccountWithRelevant;
