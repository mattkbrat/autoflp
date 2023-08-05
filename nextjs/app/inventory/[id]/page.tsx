import { getInventoryWithDeals } from '@/utils/prisma/inventory';

const InventoryWithIdPage = async ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
  const account = await getInventoryWithDeals({ inventoryID: params.id });

  return <pre>{JSON.stringify(account, null, 2)}</pre>;
};

export default InventoryWithIdPage;
