import { AsyncReturnType } from '@/types/AsyncReturn';

import { getInventoryById, getInventoryWithDeals } from '@/utils/prisma/inventory';

export type Inventory = AsyncReturnType<typeof getInventoryById>;
export type InventoryWithDeals = AsyncReturnType<typeof getInventoryWithDeals>;
