'use client';

import { memo, useMemo } from 'react';
import { Stack, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import ManageAccountsTable from '@/app/accounts/ManageAccountsTable';
import PersonForm from '@/components/forms/PersonForm';
import { AccountsWithRelevant } from '@/types/prisma/accounts';

async function AccountPage({ data }: { data: AccountsWithRelevant[number][] }) {
  const router = useRouter();

  return (
    <Stack>
      <Tabs isLazy>
        <TabList>
          <Tab>New Account</Tab>
          <Tab>Manage Accounts</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <PersonForm editing={null} />
          </TabPanel>
          <TabPanel>
            <Stack>
              <ManageAccountsTable data={data} />
            </Stack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
}

export default memo(AccountPage, (prev, next) => {
  return prev.data === next.data;
});
