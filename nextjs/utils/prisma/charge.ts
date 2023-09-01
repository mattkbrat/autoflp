import prisma from '@/lib/prisma';

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

  return prisma.defaultCharge.findMany({
    where: {
      creditor,
    },
    include: {
      charge_default_charge_chargeTocharge: true,
    },
  });
}

type AllCreditorsGetterType = typeof getAllCreditorDefaultCharges;

export { getAllCreditorDefaultCharges };
export type { AllCreditorsGetterType };
