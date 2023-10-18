import prisma from '@/lib/prisma';

import { getAllCreditorDefaultCharges } from '@/utils/prisma/charge';
import { Deal } from '@/types/prisma/deals';
import notifyDeal from '@/utils/pushover/deal';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import formatInventory from '@/utils/format/formatInventory';
import { Inventory } from '@/types/prisma/inventory';
import { Salesman } from '@/types/prisma/person';
import { randomUUID } from 'crypto';
import { closeDeals } from '@/utils/prisma/deal/index';

// To create a new deal, we first to need to check:
// 1) If the vehicle being sold belongs to an open account.
// 1a) If the vehicle being sold belongs to an open account, we need to close the account.
// 2) If the deal already exists (by checking the inventoryId and accountID)
// 2a) If the deal does not exist, we need to create it.
// 2b) If the deal exists, we need to update it.

const createDeal = async ({
  deal,
  trades,
  salesmen,
  cosigner,
}: {
  deal: Deal;
  trades?: Inventory[];
  salesmen?: Salesman[];
  cosigner?: string;
}) => {
  const dealId = randomUUID();

  const openDeals = await prisma.deal.findMany({
    where: {
      state: 1,
      inventoryId: deal.inventoryId,
    },
    select: {
      id: true,
      account: true,
      inventory: {
        select: {
          state: true,
          id: true,
        },
      },
    },
  });

  const currentOpenDeal = openDeals.find(
    (openDeal) => openDeal.account === deal.account,
  );

  let dealsToClose = (
    !!currentOpenDeal
      ? openDeals.filter((openDeal) => openDeal.account !== deal.account)
      : openDeals
  ).map((d) => d.id);

  if (dealsToClose?.length > 0) {
    await closeDeals({ deals: dealsToClose });
  }

  if (!!currentOpenDeal) {
    const updateOrDeletePromises: Promise<any>[] = [
      //   Delete trades
      prisma.dealTrade.deleteMany({
        where: {
          deal: currentOpenDeal.id,
        },
      }),

      // Delete charges
      prisma.dealCharge.deleteMany({
        where: {
          deal: currentOpenDeal.id,
        },
      }),

      // Delete salesmen
      prisma.dealSalesman.deleteMany({
        where: {
          deal: currentOpenDeal.id,
        },
      }),
    ];

    // If the current inventory is not closed, close it.

    const inventoryIsClosed = currentOpenDeal.inventory.state === 0;

    if (!inventoryIsClosed) {
      updateOrDeletePromises.push(
        prisma.inventory.update({
          where: {
            id: currentOpenDeal.inventory.id,
          },
          data: {
            state: 0,
          },
        }),
      );
    }
    await Promise.all(updateOrDeletePromises);
  }

  // Update the cosigner

  await prisma.account.update({
    where: {
      id: deal.account,
    },
    data: {
      cosigner: cosigner,
    },
  });

  const existingDeal = await prisma.deal.findMany({
    where: {
      inventoryId: deal.inventoryId,
      account: deal.account,
      date: deal.date,
    },
  });

  const newDeal = await prisma.deal.upsert({
    where: {
      id: existingDeal.length > 0 ? existingDeal[0].id : dealId,
    },
    update: { ...deal },
    create: { ...deal, id: dealId },
    include: {
      inventory: true,
      Account: {
        include: {
          person: true,
        },
      },
    },
  });

  const inventory = await prisma.inventory.update({
    where: {
      id: newDeal.inventory.id,
    },
    data: {
      state: 0,
    },
  });
  //   Create the trades, salesmen, and charges

  const finishingPromises: Promise<any>[] = [];

  if (newDeal.creditor) {
    const dealCharges = getAllCreditorDefaultCharges({
      creditor: newDeal.creditor,
    }).then(async (charges) => {
      return await Promise.all(
        charges.map(async (charge) => {
          const note = charge.charge_default_charge_chargeTocharge.name;
          return prisma.dealCharge.create({
            data: {
              deal: newDeal.id,
              charge: charge.charge_default_charge_chargeTocharge.id,
              note,
              id: randomUUID(),
              date: newDeal.date,
            },
          });
        }),
      );
    });
    finishingPromises.push(dealCharges);
  }

  if (salesmen) {
    const salesmenPromises = Promise.all(
      salesmen.map(async (salesman) => {
        return await prisma.dealSalesman.upsert({
          where: {
            deal_salesman: {
              deal: newDeal.id,
              salesman: salesman,
            },
          },
          update: {},
          create: {
            deal: newDeal.id,
            salesman: salesman,
            id: randomUUID(),
          },
        });
      }),
    );
    finishingPromises.push(salesmenPromises);
  }

  if (trades) {
    const tradesPromises = Promise.all(
      trades.map(async (trade) => {
        const tradeValue = trade.cash || trade.credit || '0';
        const invObject = {
          state: 0,
          id: randomUUID(),
          vin: trade.vin,
          make: trade.make,
          model: trade.model,
          year: trade.year,
          cash: (+tradeValue * 1.25).toFixed(2),
        };
        return await prisma.inventory
          .upsert({
            where: {
              vin: trade.vin,
            },
            create: invObject,
            update: invObject,
          })
          .then((inv) =>
            prisma.dealTrade.create({
              data: {
                id: randomUUID(),
                deal: newDeal.id,
                vin: inv.vin,
                value: (+tradeValue).toFixed(2),
              },
            }),
          );
      }),
    );
    finishingPromises.push(tradesPromises);
  }

  await Promise.all(finishingPromises);

  const formattedInventory = formatInventory(inventory);

  await notifyDeal({
    fullName: fullNameFromPerson(newDeal.Account.person),
    invString: formattedInventory,
    dealId: newDeal.id,
    amount: +newDeal.cash,
    type: newDeal.id !== dealId ? 'UPDATE' : +newDeal.term > 0 ? 'CREDIT' : 'CASH',
  });

  return newDeal;
};

export default createDeal;
