import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Button, ButtonGroup, Divider } from '@chakra-ui/react';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import formatPhoneNumber from '@/utils/format/formatPhoneNumber';
import formatInventory from '@/utils/format/formatInventory';
import BasicReactTable from '@/components/table/Table';
import { AccountsWithRelevant } from '@/types/prisma/accounts';

const ManageAccountsTable = ({ data }: { data: AccountsWithRelevant[number][] }) => {

  const [filter, setFilter] = useState<null | 'complete' | 'active'>(null)

  const filteredData = useMemo(() => {
    if (!filter) return data;
    return data.filter((a) => a?.deal_deal_accountToaccount && a.deal_deal_accountToaccount.filter((d) => d.state === (filter === 'complete' ? 0 : 1)).length > 0)
  }, [data, filter])

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
        <Button onClick={() => setFilter('complete')} variant={'link'}>Complete Deals</Button>
        <Divider orientation={'vertical'} />
        <Button onClick={() => setFilter('active')} variant={'link'}>Active Deals</Button>
        <Divider orientation={'vertical'} />
        <Button onClick={() => setFilter(null)} variant={'link'}>All Accounts</Button>
      </ButtonGroup>

      <BasicReactTable
        refresh={() => {}}
        data={filteredData}
        columns={AccountTableColumns}
        heading={'Accounts'}
      />
    </>
  );
};

export default ManageAccountsTable;
