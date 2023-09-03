import prisma from '@/lib/prisma';
import { Account } from '@/types/prisma/accounts';

const updateAccount = ({
  id,
  account,
}: {
  id: string;
  account: Partial<Account>;
}) => {
  if (!account) {
    throw new Error('No account data provided');
  }

  return prisma.account.update({
    where: {
      id,
    },
    data: {
      ...account,
      date_modified: new Date().toISOString().split('T')[0],
    },
  });
};

export default updateAccount;
