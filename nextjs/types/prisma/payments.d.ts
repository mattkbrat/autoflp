import { getDealPayments } from '@/utils/prisma/payment';
import { AsyncReturnType } from '@/types/AsyncReturn';
import { Override } from '@/types/Oerride';
import { AccountWithRelevant } from '@/types/prisma/accounts';
import { Payment } from '@prisma/client';

export type PaymentWithDate = Override<
  Payment,
  { date: Date } & { payment: number }
>;

export type PartialPaymentsWithDate = PaymentWithDate;

export type DealPayment = NonNullable<AsyncReturnType<typeof getDealPayments>>;
export type Payment = Payment;

export type AccountsWithRelevantWithPayments = AccountWithRelevant & {
  payment: PaymentWithDate[];
};
