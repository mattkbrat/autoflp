import { redirect } from 'next/navigation';
import { getRequestCookie } from '@/utils/auth/getRequestCookie';
import { cookies } from 'next/headers';
import HomePage from '@/app/HomePage';

import dynamic from 'next/dynamic';
import { InventoryWithDeals } from '@/types/prisma/inventory';
import { getInventoryWithDeals } from '@/utils/prisma/inventory';
import { getBusinessData } from '@/utils/formBuilder/functions';
import { getAccountsWithRelevant } from '@/utils/prisma/account';
import { AccountsWithRelevant } from '@/types/prisma/accounts';

const HomeV2 = dynamic(() => import('@/components/Home/HomeV2'), {
  ssr: false
})

const Page = async ({searchParams, ...props}) => {
  const user = await getRequestCookie(cookies());

  let inventory: InventoryWithDeals | null = null;

  if (searchParams.inventory) {
    inventory = await getInventoryWithDeals({ inventoryId: searchParams.inventory });
  }

  if (!user) {
    redirect('/auth/login');
  }

  const businessData = getBusinessData();
  
  const accounts: AccountsWithRelevant = await getAccountsWithRelevant();

  return <HomeV2 businessData={businessData} accounts={accounts} selectedInventory={inventory} />;
};

export default Page;
