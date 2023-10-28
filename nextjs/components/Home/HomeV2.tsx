'use client';

import useInventory from '@/hooks/useInventory';
import { Skeleton, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { memo } from 'react';
import InventoryForm from '../forms/InventoryForm';
import InventoryCard from '../display/InventoryCard';
import { DealForm } from '../forms/DealForm';
import AccountTable from '../table/AccountTable';
import CreditAppsPage from '@/app/applications/ApplicationPage';
import HomeV2Props from '@/types/pages/HomeV2';

const HomeV2 = ({
  selectedInventory,
  businessData,
  accounts,
  applications,
}: HomeV2Props) => {
  const { inventory } = useInventory();

  return (
    <Tabs isLazy>
      <TabList>
        <Tab>Accounts</Tab>
        <Tab>Inventory</Tab>
        <Tab>Deal</Tab>
        <Tab>Credit Applications</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <AccountTable data={accounts} />
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
          <DealForm id={''} businessData={businessData} />
        </TabPanel>
        <TabPanel>
          {applications ? (
            <CreditAppsPage apps={applications} />
          ) : (
            <p>Could not load applications</p>
          )}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default memo(HomeV2);
