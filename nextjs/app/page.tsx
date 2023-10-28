import { redirect } from 'next/navigation';
import { getRequestCookie } from '@/utils/auth/getRequestCookie';
import { cookies } from 'next/headers';

import dynamic from 'next/dynamic';
import { getInventoryWithDeals } from '@/utils/prisma/inventory';
import { getBusinessData } from '@/utils/formBuilder/functions';
import { getAccountsWithRelevant } from '@/utils/prisma/account';
import getApplications from '@/app/applications/getApplications';

const HomeV2 = dynamic(() => import('@/components/Home/HomeV2'), {
  ssr: false,
});

const Page = async ({ searchParams }: { searchParams: { inventory: string } }) => {
  const user = await getRequestCookie(cookies());

  const businessData = getBusinessData();

  const getInventory = async () => {
    if (!searchParams.inventory) {
      return null;
    }

    return await getInventoryWithDeals({ inventoryId: searchParams.inventory });
  };

  if (!user) {
    redirect('/auth/login');
  }

  const [inventory, accounts, applications] = await Promise.all([
    await getInventory(),
    await getAccountsWithRelevant(),
    await getApplications(),
  ]);

  return (
    <HomeV2
      businessData={businessData}
      // @ts-ignore
      accounts={accounts}
      selectedInventory={inventory}
      applications={applications}
    />
  );
};

export default Page;
