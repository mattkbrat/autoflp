import prisma from '@/lib/prisma';
import { deal } from '@prisma/client';

const getDeal = async (dealId: string) => {
  return prisma.deal.findUnique({
    where: {
      id: dealId,
    },
  }) as Promise<deal>;
};

export default getDeal;
