'use client';

import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { account } from '@prisma/client';
import BasicReactTable from '@/components/table/Table';
import { AccountsWithRelevant } from '@/utils/prisma/accounts';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import { Button, ButtonGroup } from '@chakra-ui/react';

export default async function AccountTable({
  children,
}: {
  children: AccountsWithRelevant[number][];
}) {
  const columns = useMemo<ColumnDef<AccountsWithRelevant[number]>[]>(
    () => [
      {
        header: 'id',
        accessorKey: 'id',
        id: 'id',
        cell: (info) => (
          <ButtonGroup>
            <Button>{info.row.getValue('contact')}</Button>
            <Button>{info.row.getValue('license_number')}</Button>
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
    ],
    [],
  );

  return <BasicReactTable data={children} columns={columns} heading={'Accounts'} />;
}
