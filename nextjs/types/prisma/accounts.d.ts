import { AsyncReturnType } from '@/types/AsyncReturn';
import {
  getAccount,
  getAccountWithRelevant,
  getAllAccountsWithRelevantByOptionalStatus,
} from '@/utils/prisma/account';

export type Account = AsyncReturnType<typeof getAccount>;
export type Accounts = Account[];
export type AccountWithRelevant = AsyncReturnType<typeof getAccountWithRelevant>;
export type AccountsWithRelevant = AccountWithRelevant[];
export type AccountsWithRelevantByStatus = AsyncReturnType<
  typeof getAllAccountsWithRelevantByOptionalStatus
>;

export type AccountWithRelevantNotNull = NonNullable<AccountWithRelevant>;
export type AccountWithRelevantDeal =
  AccountWithRelevantNotNull['deal_deal_accountToaccount'][number];
