import { getInventoryWithDeals } from '@/utils/prisma/inventory';
import InventoryCard from '@/components/display/InventoryCard';

const InventoryWithIdPage = async ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
  const inventory = await getInventoryWithDeals({ inventoryId: params.id });

  if (!inventory) {
    return <p>No inventory found with id {params.id}</p>;
  }

  return <InventoryCard 
  inventory={inventory} 
  />;
};

export default InventoryWithIdPage;
