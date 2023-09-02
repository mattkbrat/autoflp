import { AsyncReturnType } from '@/types/AsyncReturn';

import { getInventoryById, getInventoryWithDeals } from '@/utils/prisma/inventory';

export type Inventory = NonNullable<AsyncReturnType<typeof getInventoryById>>;
export type InventoryWithDeals = NonNullable<
  AsyncReturnType<typeof getInventoryWithDeals>
>;
