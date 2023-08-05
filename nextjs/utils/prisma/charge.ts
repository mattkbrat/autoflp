import prisma from './prisma';
import generateUUID from 'lib/generateUUID';
import { AsyncReturnType } from 'types/AsyncReturnType';

import { deal_charge, default_charge } from '@prisma/client';

/**
 * Gets the default charges for a creditor.
 * @param param0 {creditor: creditor business name}
 * @returns
 */
async function getAllCreditorDefaultCharges({ creditor }: { creditor: string }) {
  if (creditor.includes('-')) {
    creditor = await prisma.creditor
      .findUnique({
        where: {
          id: creditor,
        },
      })
      .then((creditor) => creditor?.business_name as string);
  }

  const creditor_charges = await prisma.default_charge.findMany({
    where: {
      creditor,
    },
    include: {
      charge_chargeTodefault_charge: true,
    },
  });

  return creditor_charges;
}

async function createDealCharge

type AllCreditorsGetterType = typeof getAllCreditorDefaultCharges;

export { getAllCreditorDefaultCharges, createDealCharge };
export type { AllCreditorsGetterType };
