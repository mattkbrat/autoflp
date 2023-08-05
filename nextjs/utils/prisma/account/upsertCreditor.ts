import prisma from '@/lib/prisma';
import { Creditor } from '@prisma/client';
import { randomUUID } from 'crypto';

const upsertCreditor = async ({ creditor }: { creditor: Partial<Creditor> }) => {
  return await prisma.creditor.upsert({
    where: {
      id: creditor.id,
    },
    update: {
      ...creditor,
    },
    create: {
      ...creditor,
      contact: creditor.contact || 'Unknown',
      business_name: creditor.business_name || 'Unknown',
      filing_fees: creditor.filing_fees || '0',
      id: randomUUID(),
    },
  });
};

export default upsertCreditor;
