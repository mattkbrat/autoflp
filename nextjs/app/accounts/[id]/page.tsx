import { redirect } from 'next/navigation';
import StackLayout from '@/components/StackLayout';
import IndividualAccountPage from '@/app/accounts/[id]/IndividualAccountPage';
import { getAccountWithRelevant } from '@/utils/prisma/account';

const AccountWithIdPage = async ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
  const account = await getAccountWithRelevant({ id: params.id });

  if (!account) {
    redirect('/accounts');
  }

  return (
    <StackLayout>
      <IndividualAccountPage account={account} />
    </StackLayout>
  );
};

export default AccountWithIdPage;
