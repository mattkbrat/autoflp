import prisma from '@/lib/prisma';
import { Deal } from '@/types/prisma/deals';
import notifyDeal from '@/utils/pushover/deal';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import formatInventory from '@/utils/format/formatInventory';

const updateDeal = async ({ id, data }: { id: string; data: Partial<Deal> }) => {
  return await prisma.deal
    .update({
      where: {
        id,
      },
      include: {
        inventory: true,
        Account: {
          select: {
            person: true,
          },
        },
      },
      data,
    })
    .then(async (deal) => {
      await notifyDeal({
        amount: +deal.cash,
        dealId: deal.id,
        type: data.state === 0 ? 'CLOSE' : 'UPDATE',
        fullName: fullNameFromPerson(deal.Account.person),
        invString: formatInventory(deal.inventory),
      });
      return deal;
    });
};

export default updateDeal;
