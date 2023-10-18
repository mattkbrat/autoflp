import InventoryCard from '@/components/display/InventoryCard';
import InventoryForm from '@/components/forms/InventoryForm';
import { InventoryWithDeals } from '@/types/prisma/inventory';
import { getRequestCookie } from '@/utils/auth/getRequestCookie';
import { getInventoryWithDeals } from '@/utils/prisma/inventory';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const InventoryPage = async ({searchParams, inventory = null}: {
  searchParams: {inventory?: string}
  inventory?: InventoryWithDeals | null
}) => {
  const user = await getRequestCookie(cookies());
  if (!user) {
    redirect('/auth/login');
  }

  const id = searchParams?.inventory;

  if (id && !inventory) {
    inventory = await getInventoryWithDeals({ inventoryId: id });
  }

  console.log(inventory)

  return (
    <div>
      {
        inventory?.id && (
          <InventoryCard withAccounts={true} inventoryID={inventory.id} inventory={inventory} />
        )
      }

      <InventoryForm id={id} />
    </div>
  );
};

export default InventoryPage;
