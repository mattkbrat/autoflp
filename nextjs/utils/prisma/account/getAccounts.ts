import prisma from '@/lib/prisma';

const getAccounts = async ({ withPerson }: { withPerson?: boolean }) => {
  return await prisma.account.findMany({
    include: {
      person: withPerson,
    },
    orderBy: {
      person: {
        last_name: 'desc',
      },
    },
  });
};

export default getAccounts;
