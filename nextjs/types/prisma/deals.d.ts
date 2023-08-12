import { AsyncReturnType } from '@/types/AsyncReturn';

import { getDealsWithRelevant, getDeal } from '@/utils/prisma/deal';
import { Creditor } from '@prisma/client';

export type DealWithRelevant = AsyncReturnType<typeof getDealsWithRelevant>;
export type Deal = AsyncReturnType<typeof getDeal>;

export type SimpleDeal = {
  formattedInventory: string;
  lien: string;
  cash: string;
  status: boolean; // true = open, false = closed
  creditors: Creditor;
};
