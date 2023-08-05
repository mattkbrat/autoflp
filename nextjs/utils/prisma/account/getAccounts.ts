import prisma from '@/lib/prisma';

const getAccounts = async ({ withPerson }: { withPerson?: boolean }) => {
  return prisma.account.findMany({
    include: {
      person: withPerson,
    },
    orderBy: {
      person: withPerson
        ? {
            last_name: 'desc',
          }
        : undefined,
      date_added: 'desc',
    },
  });
};

export default getAccounts;
