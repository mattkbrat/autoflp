'use client';

import { memo, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { account } from '@prisma/client';
import BasicReactTable from '@/components/table/Table';
import { AccountsWithRelevant } from '@/utils/prisma/accounts';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import { Button, ButtonGroup, Divider, Heading, Stack } from '@chakra-ui/react';
import formatInventory from '@/utils/format/formatInventory';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import formatPhoneNumber from '@/utils/format/formatPhoneNumber';

async function AccountTable({ data }: { data: AccountsWithRelevant[number][] }) {
  const router = useRouter();

  const AccountTableColumns = useMemo<ColumnDef<AccountsWithRelevant[number]>[]>(
    () => [
      {
        header: 'id',
        accessorKey: 'id',
        id: 'id',
        cell: (info) => (
          <Link href={`/accounts/${info.row.original.id}`} passHref>
            <Button variant={'link'}>Manage</Button>
          </Link>
        ),
      },
      {
        header: 'contact',
        accessorFn: (row) => fullNameFromPerson(row.person) ?? '',
        id: 'contact',
      },
      {
        header: 'primary phone',
        accessorFn: (row) => formatPhoneNumber(row.person.phone_primary || ''),
        id: 'phone',
      },
      {
        header: 'license number',
        accessorFn: (row) => row.license_number ?? '',
        id: 'license_number',
      },
      {
        header: 'Latest inventory',
        accessorFn: (row) =>
          formatInventory(
            row.deal_deal_accountToaccount[0]?.inventory_deal_inventoryToinventory,
          ) ?? '',
        id: 'inventory',
      },
    ],
    [],
  );

  return (
    <Stack>
      <ButtonGroup alignSelf={'center'}>
        <Link href={'/deals/complete'} passHref>
          <Button variant={'link'}>Complete Deals</Button>
        </Link>
        <Divider orientation={'vertical'} />
        <Link href={'/deals/active'} passHref>
          <Button variant={'link'}>Active Deals</Button>
        </Link>
        <Divider orientation={'vertical'} />

        <Link href={'/deals'} passHref>
          <Button variant={'link'}>All Accounts</Button>
        </Link>
      </ButtonGroup>

      <BasicReactTable
        refresh={() => {}}
        data={data}
        columns={AccountTableColumns}
        heading={'Accounts'}
      />
    </Stack>
  );
}

export default memo(AccountTable, (prev, next) => {
  return prev.data === next.data;
});
