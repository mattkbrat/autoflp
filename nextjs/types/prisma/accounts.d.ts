import { Account as PrismaAccount } from '@prisma/client';

import { AsyncReturnType } from '@/types/AsyncReturn';
import {
  getAccountWithRelevant,
  getAllAccountsWithRelevantByOptionalStatus,
} from '@/utils/prisma/account';

export type Account = PrismaAccount;
export type Accounts = Account[];
export type AccountWithRelevant = AsyncReturnType<typeof getAccountWithRelevant>;
export type AccountsWithRelevant = AccountWithRelevant[];
export type AccountsWithRelevantByStatus = AsyncReturnType<
  typeof getAllAccountsWithRelevantByOptionalStatus
>;

export type AccountWithRelevantNotNull = NonNullable<AccountWithRelevant>;
export type AccountWithRelevantDeal =
  AccountWithRelevantNotNull['deal_deal_accountToaccount'][number];

export type AccountWithRelevantDealOmit = Omit<
  AccountWithRelevantNotNull,
  'deal_deal_accountToaccount'
>;
