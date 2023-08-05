import prisma from '@/lib/prisma';
import notifyDeal from '@/utils/pushover/deal';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import formatInventory from '@/utils/format/formatInventory';
import { Deal } from '@/types/prisma/deals';

const closeDeals = async ({ deals }: { deals: Deal['id'][] }) => {
  return prisma
    .$transaction(
      deals.map((id) =>
        prisma.deal.update({
          where: {
            id,
          },
          data: {
            state: 0,
          },
          select: {
            id: true,
            inventory: true,
            Account: {
              select: {
                person: true,
              },
            },
          },
        }),
      ),
    )
    .then((results) =>
      Promise.all(
        results.map((lookup) => {
          notifyDeal({
            fullName: fullNameFromPerson(lookup.Account.person),
            dealId: lookup.id,
            type: 'CLOSE',
            invString: formatInventory(lookup.inventory),
          }).then(() => {
            return lookup.id;
          });
        }),
      ),
    ) as Promise<Deal['id'][]>;
};

export default closeDeals;
