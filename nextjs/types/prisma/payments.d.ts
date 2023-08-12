import { getDealPayments } from '@/utils/prisma/payment';
import { AsyncReturnType } from '@/types/AsyncReturn';
import { Override } from '@/types/Oerride';
import { AccountWithRelevant } from '@/types/prisma/accounts';

export type PaymentWithDate = Override<
  Payment,
  { date: Date } & { payment: number }
>;

export type PartialPaymentsWithDate = PaymentWithDate;

export type Payment = AsyncReturnType<typeof getDealPayments>[number];

export type AccountsWithRelevantWithPayments = AccountWithRelevant & {
  payment: PaymentWithDate[];
};
