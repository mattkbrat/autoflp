import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Button, ButtonGroup, Divider } from '@chakra-ui/react';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import formatPhoneNumber from '@/utils/format/formatPhoneNumber';
import formatInventory from '@/utils/format/formatInventory';
import BasicReactTable from '@/components/table/Table';
import { AccountsWithRelevant } from '@/types/prisma/accounts';

const ManageAccountsTable = ({ data }: { data: AccountsWithRelevant[number][] }) => {
  const AccountTableColumns = useMemo<ColumnDef<AccountsWithRelevant[number]>[]>(
    () => [
      {
        header: 'id',
        accessorKey: 'id',
        id: 'id',
        cell: (info) => (
          <Link href={`/accounts/${info.row?.original?.id}`} passHref>
            <Button variant={'link'}>Manage</Button>
          </Link>
        ),
      },
      {
        header: 'contact',
        accessorFn: (row) => (row?.person ? fullNameFromPerson(row?.person) : ''),
        id: 'contact',
      },
      {
        header: 'primary phone',
        accessorFn: (row) => formatPhoneNumber(row?.person.phone_primary || ''),
        id: 'phone',
      },
      {
        header: 'license number',
        accessorFn: (row) => row?.license_number ?? '',
        id: 'license_number',
      },
      {
        header: 'Latest inventory',
        accessorFn: (row) =>
          formatInventory(row?.deal_deal_accountToaccount[0]?.inventory) ?? '',
        id: 'inventory',
      },
    ],
    [],
  );

  return (
    <>
      <ButtonGroup alignSelf={'center'}>
        <Button variant={'link'}>Complete Deals</Button>
        <Divider orientation={'vertical'} />
        <Button variant={'link'}>Active Deals</Button>
        <Divider orientation={'vertical'} />
        <Button variant={'link'}>All Accounts</Button>
      </ButtonGroup>

      <BasicReactTable
        refresh={() => {}}
        data={data}
        columns={AccountTableColumns}
        heading={'Accounts'}
      />
    </>
  );
};

export default ManageAccountsTable;
