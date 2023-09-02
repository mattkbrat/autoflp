import prisma from '@/lib/prisma';

import { getAllCreditorDefaultCharges } from '@/utils/prisma/charge';
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
import {
  closeDeals,
  createDealSalesman,
  getCurrentDealsWithInventory,
} from '@/utils/prisma/deal';
import { Inventory } from '@/types/prisma/inventory';
import { Salesman } from '@/types/prisma/person';
import createDealCharge from '@/utils/prisma/charge/createDealCharge';
import { generate } from '@/utils/formBuilder';
import { randomUUID } from 'crypto';

const createDeal = async ({
  deal,
  trades,
  salesmen,
}: {
  deal: Deal;
  trades?: Inventory[];
  salesmen?: Salesman[];
}) => {
  console.log(deal);

  const inventoryIdIsVin = deal.inventoryId.length === 17;

  const dealId = randomUUID();

  const transaction = await prisma.$transaction(async (tx) => {
    const dealTransaction = await tx.deal.upsert({
      where: {
        date_account_inventoryId: {
          date: deal.date,
          account: deal.account,
          inventoryId: deal.inventoryId,
        },
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

    const closedDeals = await tx.deal.updateMany({
      where: {
        inventoryId: deal.inventoryId,
        state: 1,
        id: {
          not: dealTransaction.id,
        },
      },
      data: {
        state: 0,
      },
    });

    const inventoryTransaction = await tx.inventory.update({
      where: inventoryIdIsVin
        ? { vin: deal.inventoryId }
        : {
            id: deal.inventoryId,
          },
      data: {
        state: 0,
      },
    });

    // Delete existing trades in the case of an updated deal not having the same trade line.
    await tx.dealTrade.deleteMany({
      where: {
        deal: dealTransaction.id,
      },
    });

    if (Array.isArray(trades)) {
      for (const trade of trades) {
        try {
          const inventory = trade;

          if (!inventory) {
            continue;
          }

          const tradeValue = inventory.cash || inventory.credit || '0';

          inventory.cash = '0';
          inventory.credit = '0';

          await tx.dealTrade.upsert({
            where: {
              deal_vin: {
                deal: dealTransaction.id,
                vin: inventory.vin,
              },
            },
            update: {
              value: (+tradeValue).toFixed(2),
            },
            create: {
              id: randomUUID(),
              deal: dealTransaction.id,
              vin: inventory.vin,
              value: (+tradeValue).toFixed(2),
            },
          });
        } catch (error) {
          console.error(error);
          throw 'Error creating deal trade';
        }
      }
    }

    for (const salesman of salesmen || []) {
      console.log({ salesman });

      await tx.dealSalesman.upsert({
        where: {
          deal_salesman: {
            deal: dealTransaction.id,
            salesman: salesman,
          },
        },
        update: {},
        create: {
          deal: dealTransaction.id,
          salesman: salesman,
          id: randomUUID(),
        },
      });
    }

    if (deal.creditor === null) {
      return {
        deal: dealTransaction,
        inventory: inventoryTransaction,
        closed: closedDeals,
      };
    }

    // Delete the charges in the case of an updated creditor having different charges.
    await tx.dealCharge.deleteMany({
      where: {
        deal: dealTransaction.id,
      },
    });

    const creditor_charges = await getAllCreditorDefaultCharges({
      creditor: deal.creditor,
    });

    for (const charge of creditor_charges) {
      const note = charge.charge_default_charge_chargeTocharge.name;
      await tx.dealCharge.upsert({
        where: {
          deal_charge: {
            deal: dealTransaction.id,
            charge: charge.charge_default_charge_chargeTocharge.id,
          },
        },
        update: {
          note,
          date: deal.date,
        },
        create: {
          deal: dealTransaction.id,
          charge: charge.charge_default_charge_chargeTocharge.id,
          note,
          id: randomUUID(),
          date: dealTransaction.date,
        },
      });
    }

    const account = dealTransaction.Account;

    if (!dealTransaction.inventory) {
      console.error('No inventory found for deal', dealTransaction.id);
      throw new Error();
    }

    if (!account || !account.person) {
      console.error('No account found for deal', dealTransaction.id);
      throw new Error();
    }

    return {
      deal: dealTransaction,
      inventory: inventoryTransaction,
      closed: closedDeals,
    };
  });

  const { deal: createdDeal, inventory: createdInventory } = transaction;

  const formattedInventory = formatInventory(createdInventory);

  console.log(
    {
      createdDeal,
    },
    dealId,
  );

  await notifyDeal({
    fullName: fullNameFromPerson(createdDeal.Account.person),
    invString: formattedInventory,
    dealId: createdDeal.id,
    amount: +createdDeal.cash,
    type:
      createdDeal.id !== dealId
        ? 'UPDATE'
        : +createdDeal.term > 0
        ? 'CREDIT'
        : 'CASH',
  });

  return createdDeal;
};

export default createDeal;
