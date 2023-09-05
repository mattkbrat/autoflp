import { AsyncReturnType } from '@/types/AsyncReturn';

import { getDealsWithRelevant, getDeal } from '@/utils/prisma/deal';
import { Creditor } from '@prisma/client';
import getDealWithPayments from '@/utils/prisma/deal/getDealWithPayments';
import { getDealsWithPayments } from '@/utils/prisma/payment/getDealPayments';
import { getDealPayments } from '@/utils/prisma/payment';
import { Override } from '@/types/Oerride';

export type DealsWithRelevant = AsyncReturnType<typeof getDealsWithRelevant>;
export type DealWithRelevant = DealsWithRelevant[number];
export type Deal = NonNullable<AsyncReturnType<typeof getDeal>>;

export type DealPayments = NonNullable<AsyncReturnType<typeof getDealPayments>>;
export type DealsPayments = AsyncReturnType<typeof getDealsWithPayments>;

type OverrideDealPayments = Override<
  DealPayments['payments'][number],
  {
    date: Date | string;
  }
>[];

export type DealPaymentsWithDate = Override<
  DealPayments,
  {
    payments: OverrideDealPayments;
  }
>;


export type DealsPaymentsPayments = NonNullable<DealsPayments>[number]['payments'];

export type SimpleDeal = {
  formattedInventory?: string;
  id: string;
  lien: string;
  cash: string;
  status: boolean; // true = open, false = closed
  creditors?: Creditor | null;
};

export type DealWithPayments = AsyncReturnType<typeof getDealWithPayments>;
