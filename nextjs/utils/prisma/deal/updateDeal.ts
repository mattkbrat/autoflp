import prisma from '@/lib/prisma';
import { Deal } from '@/types/prisma/deals';

const updateDeal = async ({ id, data }: { id: string; data: Partial<Deal> }) => {
  return await prisma.deal.update({
    where: {
      id,
    },
    include: {
      inventory: true,
      account: {
        select: {
          person: true,
        },
      },
    },
    data,
  });
};
