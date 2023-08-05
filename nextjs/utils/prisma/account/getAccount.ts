import prisma from '@/lib/prisma';
import { Account, Person } from '@prisma/client';

const getAccount = ({
  id,
  creditorId,
  personId,
  withPerson,
}: {
  id?: string;
  creditorId?: string;
  personId?: string;
  withPerson?: boolean;
}) => {
  return prisma.account.findUnique({
    where: {
      id,
      person: {
        creditors: {
          some: {
            id: creditorId,
          },
        },
        id: personId,
      },
    },
    include: {
      person: withPerson,
    },
  }) as Promise<Account & { person: Person | undefined }>;
};

export default getAccount;
