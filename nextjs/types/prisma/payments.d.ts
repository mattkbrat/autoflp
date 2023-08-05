import { getDealPayments } from '@/utils/prisma/payment';
import { AsyncReturnType } from '@/types/AsyncReturn';

export type DealPayments = AsyncReturnType<typeof getDealPayments>;
