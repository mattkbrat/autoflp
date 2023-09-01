import { AsyncReturnType } from '@/types/AsyncReturn';

import { getDealsWithRelevant, getDeal } from '@/utils/prisma/deal';
import { Creditor } from '@prisma/client';
import getDealWithPayments from '@/utils/prisma/deal/getDealWithPayments';

export type DealsWithRelevant = AsyncReturnType<typeof getDealsWithRelevant>;
export type DealWithRelevant = DealsWithRelevant[number];
export type Deal = NonNullable<AsyncReturnType<typeof getDeal>>;

export type SimpleDeal = {
  formattedInventory?: string;
  id: string;
  lien: string;
  cash: string;
  status: boolean; // true = open, false = closed
  creditors?: Creditor | null;
};

export type DealWithPayments = AsyncReturnType<typeof getDealWithPayments>;
