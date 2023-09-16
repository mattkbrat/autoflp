import { redirect } from 'next/navigation';
import StackLayout from '@/components/StackLayout';
import IndividualAccountPage from '@/app/accounts/[id]/IndividualAccountPage';
import { getAccountWithRelevant } from '@/utils/prisma/account';
import formatInventory from '@/utils/format/formatInventory';
import { SimpleDeal } from '@/types/prisma/deals';
import { getRequestCookie } from '@/utils/auth/getRequestCookie';
import { cookies } from 'next/headers';

const AccountWithIdPage = async ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
  const user = await getRequestCookie(cookies());
  if (!user) {
    redirect('/auth/login');
  }

  const account = await getAccountWithRelevant({ id: params.id });

  if (!account) {
    console.error('Account not found', params.id);
    redirect('/accounts');
  }

  const { deal_deal_accountToaccount: accountDeals, ...rest } = account;

  const deals = accountDeals
    .map((d) => {
      return {
        formattedInventory: formatInventory(d.inventory),
        lien: d.lien,
        cash: d.cash,
        status: d.state === 1,
        creditors: d.creditors,
        id: d.id,
      };
    })
    .sort((a, b) => {
      // Sort the deals by status, then by inventory
      if (a.status && !b.status) {
        return -1;
      } else if (!a.status && b.status) {
        return 1;
      } else {
        return a.formattedInventory.localeCompare(b.formattedInventory);
      }
    }) as SimpleDeal[];

  return (
    <StackLayout>
      <IndividualAccountPage account={rest} deals={deals} />
    </StackLayout>
  );
};

export default AccountWithIdPage;
