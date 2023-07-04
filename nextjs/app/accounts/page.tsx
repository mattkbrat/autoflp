import { getRequestCookie } from '@/utils/auth/getRequestCookie';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAllWithRelevant } from '@/utils/prisma/accounts';
import { stat } from 'fs';

import dynamic from 'next/dynamic';

const AccountTable = dynamic(() => import('@/components/table/AccountTable'), {
  ssr: false,
});

const DealsPage = async () => {
  const user = await getRequestCookie(cookies());

  if (!user) {
    redirect('/auth/login');
  }

  const accounts = await getAllWithRelevant();

  return <AccountTable data={accounts} />;
};

export default DealsPage;
