import prisma from '@/lib/prisma';
import accountPersonSelect from './accountPersonSelect';

const getAllAccountsWithRelevantByOptionalStatus = ({
  status,
}: {
  status?: string;
}) => {
  const state = status ? (status === 'active' ? 1 : 0) : undefined;

  return prisma.account.findMany({
    include: {
      person: true,
      deal_deal_accountToaccount: {
        include: {
          creditors: true,
          inventory: true,
          dealSalesmen: {
            select:{
              Salesman: {
                select: {
                  person: true
                }
              }
            }
          },
        },
        orderBy: {
          date: 'desc',
        },
        take: 1,
      },
    },
    where: {
      deal_deal_accountToaccount: {
        some: {
          state: state,
        },
      },
    },
    orderBy: {
      person: {
        last_name: 'desc',
      },
    },
  });
};

export default getAllAccountsWithRelevantByOptionalStatus;
