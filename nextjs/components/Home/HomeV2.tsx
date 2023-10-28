'use client';

import InventoryPage from '@/app/inventory/InventoryPage';
import useInventory from '@/hooks/useInventory';
import { Skeleton, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { memo, useMemo } from 'react';
import InventoryForm from '../forms/InventoryForm';
import { InventoryWithDeals } from '@/types/prisma/inventory';
import InventoryCard from '../display/InventoryCard';
import { DealForm } from '../forms/DealForm';
import { BusinessData } from '@/types/BusinessData';
import AccountTable from '../table/AccountTable';
import { AccountsWithRelevant } from '@/types/prisma/accounts';

const HomeV2 = ({
  selectedInventory,
  businessData,
  accounts,
}: {
  selectedInventory?: InventoryWithDeals | null;
  businessData: BusinessData;
  accounts: AccountsWithRelevant
}) => {
  const { inventory } = useInventory();

  return (
    <Tabs isLazy>
      <TabList>
        <Tab>Accounts</Tab>
        <Tab>Inventory</Tab>
        <Tab>Deal</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <AccountTable data={accounts}/>
        </TabPanel>
        <TabPanel>
          <Skeleton isLoaded={!!inventory}>
            {selectedInventory && (
              <InventoryCard
                withAccounts={true}
                inventoryID={selectedInventory.id}
                inventory={selectedInventory}
              />
            )}

            {inventory && <InventoryForm id={selectedInventory?.id} />}
          </Skeleton>
        </TabPanel>
        <TabPanel>
          <DealForm id={""} businessData={businessData}/>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default memo(HomeV2);
