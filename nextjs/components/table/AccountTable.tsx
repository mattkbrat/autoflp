'use client';

import { memo } from 'react';
import { Stack, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import ManageAccountsTable from '@/app/accounts/ManageAccountsTable';
import PersonForm from '@/components/forms/PersonForm';
import { AccountsWithRelevant } from '@/types/prisma/accounts';

async function AccountPage(props: { data?: AccountsWithRelevant[number][] }) {
  const data = props?.data || null;

  return (
    <Stack>
      <Tabs isLazy>
        <TabList>
          {data && <Tab>Manage Accounts</Tab>}
          <Tab>New Account</Tab>
        </TabList>

        <TabPanels>
          {data && (
            <TabPanel>
              <Stack>
                <ManageAccountsTable data={data} />
              </Stack>
            </TabPanel>
          )}
          <TabPanel>
            <PersonForm editing={null} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
}

export default memo(AccountPage);
