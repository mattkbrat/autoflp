'use client';

import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { account } from '@prisma/client';
import BasicReactTable from '@/components/table/Table';
import { AccountsWithRelevant } from '@/utils/prisma/accounts';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import { Button, ButtonGroup } from '@chakra-ui/react';
import formatInventory from '@/utils/format/formatInventory';

const deleteAccount = (id: string) => {
  return fetch(`/api/accounts/${id}`, {
    method: 'DELETE',
  });
};

const AccountTableColumns = () => {
  return useMemo<ColumnDef<AccountsWithRelevant[number]>[]>(
    () => [
      {
        header: 'id',
        accessorKey: 'id',
        id: 'id',
        cell: (info) => (
          <ButtonGroup>
            <Button
              onClick={async () => {
                const accountID = info.row.original.id;
                const fullName = fullNameFromPerson(info.row.original.person);
                const invString = formatInventory(
                  info.row.original.deal_deal_accountToaccount[0]
                    ?.inventory_deal_inventoryToinventory,
                );
                const account = `${fullName} - ${invString}`;
                if (!confirm(`Are you sure you want to delete ${account}`)) return;
                await deleteAccount(accountID);
              }}
            >
              Delete
            </Button>
            <Button>Record Payment</Button>
          </ButtonGroup>
        ),
      },
      {
        header: 'contact',
        accessorFn: (row) => fullNameFromPerson(row.person) ?? '',
        id: 'contact',
      },
      {
        header: 'license_number',
        accessorFn: (row) => row.license_number ?? '',
        id: 'license_number',
      },
      {
        header: 'inventory',
        accessorFn: (row) =>
          formatInventory(
            row.deal_deal_accountToaccount[0]?.inventory_deal_inventoryToinventory,
          ) ?? '',
        id: 'inventory',
      },
    ],
    [],
  );
};

export default async function AccountTable({
  data,
}: {
  data: AccountsWithRelevant[number][];
}) {
  return (
    <BasicReactTable
      refresh={() => {}}
      data={data}
      columns={AccountTableColumns()}
      heading={'Accounts'}
    />
  );
}
