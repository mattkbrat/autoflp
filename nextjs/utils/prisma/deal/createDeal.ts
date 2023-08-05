import prisma from '@/lib/prisma';

import { inventory, salesman } from '@prisma/client';
import {
  createDealCharge,
  getAllCreditorDefaultCharges,
} from '@/utils/prisma/charge';
import { Deal } from '@/types/prisma/deals';
import getDeal from '@/utils/prisma/deal/getDeal';
import { getAccount } from '@/utils/prisma/account';
import notifyDeal from '@/utils/pushover/deal';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import formatInventory from '@/utils/format/formatInventory';
import {
  createInventory,
  createTrade,
  getInventory,
} from '@/utils/prisma/inventory';
import { closeDeals, getCurrentDealsWithInventory } from '@/utils/prisma/deal';

const createDeal = async ({
  deal,
  trades,
  salesmen,
}: {
  deal: Deal;
  trades?: inventory[];
  salesmen?: salesman[];
}) => {
  const existingDeals = (
    await getCurrentDealsWithInventory({
      inventory: deal.inventory_id,
      exclude: [deal.id],
    })
  ).map((deal) => deal.id);

  if (existingDeals.length > 0) {
    await closeDeals({
      deals: existingDeals,
    });
  }

  const exists = await getDeal(deal.id);

  const transaction = await prisma.$transaction([
    exists
      ? prisma.deal.update({
          where: {
            id: deal.id,
          },
          data: { ...deal },
          include: {
            inventory: {
              select: {
                vin: true,
              },
            },
          },
        })
      : prisma.deal.create({
          data: { ...deal },
        }),

    // prisma.deal.upsert({
    //   where: {
    //     id: deal.id,
    //   },
    //   update: {...deal},
    //   create: {...deal},
    // }),

    prisma.inventory.update({
      where: {
        vin: deal.inventory_id,
      },
      data: {
        state: 0,
      },
    }),
  ]);

  if (Array.isArray(trades)) {
    for (const trade of trades) {
      try {
        const inventory = trade;

        const tradeValue = inventory.cash || inventory.credit || '0';

        inventory.cash = '0';
        inventory.credit = '0';

        await createInventory({ inventory: trade });

        await createTrade({
          deal: deal.id,
          vin: inventory.vin,
          value: tradeValue,
        });
      } catch (error) {
        console.error(error);
        throw 'Error creating deal trade';
      }
    }
  }

  if (deal.creditor_id === null) {
    return {
      deal: transaction[0],
      inventory: transaction[1],
    };
  }

  const creditor_charges = await getAllCreditorDefaultCharges({
    creditor: deal.creditor_id,
  });

  for (const charge of creditor_charges) {
    const note = charge.charge_chargeTodefault_charge.name;
    await createDealCharge({
      deal: transaction[0].id,
      charge: charge.charge,
      note,
      date: deal.date,
    });
  }

  const createdDeal = transaction[0];

  const inventory = await getInventory({ deal: createdDeal.id });
  const account = await getAccount({ id: createdDeal.account_id });

  if (!inventory) {
    console.error('No inventory found for deal', createdDeal.id);
  }

  if (!account) {
    console.error('No account found for deal', createdDeal.id);
  }

  await notifyDeal({
    dealId: createdDeal.id,
    // salesman: (Array.isArray(deal_salesman) ? deal_salesman[0] : deal_salesman).salesman,
    fullName: fullNameFromPerson(account?.person),
    amount: +createdDeal.term > 0 ? +(createdDeal.lien || 0) : +createdDeal.cash,
    invString: formatInventory(inventory),
    type: exists ? 'UPDATE' : +createdDeal.term !== 0 ? 'CREDIT' : 'CASH',
  });

  return {
    deal: transaction[0],
    inventory: transaction[1],
  };
};

export default createDeal;
