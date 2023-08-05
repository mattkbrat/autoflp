import { AsyncReturnType } from '@/types/AsyncReturn';

import { getDealsWithRelevant, getDeal } from '@/utils/prisma/deal';

export type DealWithRelevant = AsyncReturnType<typeof getDealsWithRelevant>;
export type Deal = AsyncReturnType<typeof getDeal>;
