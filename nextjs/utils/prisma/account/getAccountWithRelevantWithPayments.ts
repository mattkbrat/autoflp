import { AccountsWithRelevantWithPayments } from '@/types/prisma/payments';
import { getAccountWithRelevant } from '@/utils/prisma/account/index';
import { getDealPayments } from '@/utils/prisma/payment';

const getAccountWithRelevantWithPayments = async ({
  deal: dealId,
}: {
  deal: string;
}) => {
  const deal = await getDealPayments({ deal: dealId });

  if (deal === null) {
    // return res.status(404).send("Deal not found")
    throw new Error('Deal not found');
  }

  const accountWithRelevant = await getAccountWithRelevant({ id: deal.Account.id });

  if (!accountWithRelevant?.person) {
    // return res.status(404).send("Account not found")
    throw new Error('Account not found');
  }

  return {
    ...accountWithRelevant,
    payment: deal.payments.map((p) => ({
      ...p,
      date: new Date(p.date),
      payment: +p.amount,
    })),
  } as AccountsWithRelevantWithPayments;
};

export default getAccountWithRelevantWithPayments;
