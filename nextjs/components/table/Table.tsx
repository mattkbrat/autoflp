'use client';

import React, { useEffect } from 'react';
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaAngleLeft,
  FaAngleRight,
  FaSearch,
  FaSortAlphaDown,
  FaSortAlphaUp,
} from 'react-icons/fa';

import { DebouncedInput } from '@/components/DebouncedInput';
import { Filter } from '@/components/table/Filter';
import {
  Button,
  ButtonGroup,
  Table as ChakraTable,
  Checkbox,
  Flex,
  Heading,
  HStack,
  Icon,
  InputGroup,
  InputLeftAddon,
  Select,
  Spacer,
  Stack,
  StackDivider,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { RankingInfo, rankItem } from '@tanstack/match-sorter-utils';
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }

  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

// async function fetchDeals (resultsType: string): Promise<getActivityByPointerType> {
//     return await fetch('/api/deals?transactionType='+resultsType).then((r) => r.json())
// }

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

function BasicReactTable(props: {
  data: any;
  resultsType?: string;
  refresh: () => void;
  columns: ColumnDef<any>[];
  createForm?: JSX.Element;
  heading: string | JSX.Element;
  checkAll?: (e: any) => void;
  isChecked?: boolean;
  isIndeterminate?: boolean;
}) {
  const rerender = React.useReducer(() => ({}), {})[1];

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const [globalFilter, setGlobalFilter] = React.useState('');

  const refreshData = props.refresh;

  const table = useReactTable({
    data: props.data,
    columns: props.columns,
    manualPagination: false,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    debugTable: false,
    debugHeaders: false,
    debugColumns: false,
  });

  useEffect(() => {
    table.setPageSize(25);
  }, []);

  return (
    <Stack padding={2} spacing={4}>
      <Heading>{props.heading}</Heading>
      {props.createForm && props.createForm}
      <InputGroup>
        <InputLeftAddon pointerEvents="none">
          <Icon as={FaSearch} color="gray.300" />
        </InputLeftAddon>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={(value) => setGlobalFilter(String(value))}
          className="p-2 font-lg shadow border border-block"
          placeholder="Search all columns..."
        />
      </InputGroup>{' '}
      <ChakraTable>
        {' '}
        <Thead>
          {' '}
          {table.getHeaderGroups().map((headerGroup, n) => (
            <Tr key={`tr-${n}`}>
              {headerGroup.headers.map((header, k) => {
                return (
                  <Th key={`hear-${k}`} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <>
                        <Flex
                          w={'full'}
                          {...{
                            className: header.column.getCanSort()
                              ? 'cursor-pointer select-none'
                              : '',
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {
                            {
                              asc: <FaSortAlphaUp />,
                              desc: <FaSortAlphaDown />,
                            }[null ?? (header.column.getIsSorted() as string)]
                          }
                        </Flex>
                        {header.column.getCanFilter() ? (
                          header.column.id === 'id' ? (
                            <Checkbox
                              isChecked={props.isChecked || false}
                              isIndeterminate={props.isIndeterminate || false}
                              onChange={props.checkAll}
                            />
                          ) : (
                            <Filter column={header.column} table={table} />
                          )
                        ) : null}
                      </>
                    )}
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {' '}
          {table.getRowModel().rows.map((row, i) => {
            return (
              <Tr key={i}>
                {row.getVisibleCells().map((cell, i) => {
                  return (
                    <Td key={i}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
        </Tbody>
      </ChakraTable>{' '}
      <Spacer />{' '}
      <HStack alignItems={'center'} justifyItems={'stretch'}>
        <ButtonGroup variant="outline" colorScheme="blue" size="sm" isAttached>
          <Button
            className="border rounded p-1"
            onClick={() => {
              //    Return to start of table
              table.setPageIndex(0);
              rerender();
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <FaAngleDoubleLeft />{' '}
          </Button>{' '}
          <Button
            onClick={() => {
              //    Go back one page
              table.setPageIndex(table.getState().pagination.pageIndex - 1);
              rerender();
            }}
            disabled={!table.getCanPreviousPage()}
          >
            <FaAngleLeft />{' '}
          </Button>{' '}
          <Button
            onClick={() => {
              //    Go forward one page
              table.setPageIndex(table.getState().pagination.pageIndex + 1);
              rerender();
            }}
            disabled={!table.getCanNextPage()}
          >
            <FaAngleRight />{' '}
          </Button>{' '}
          <Button
            onClick={() => {
              //    Go to last page
              table.setPageIndex(table.getPageCount() - 1);
              rerender();
            }}
            disabled={!table.getCanNextPage()}
          >
            <FaAngleDoubleRight />{' '}
          </Button>{' '}
        </ButtonGroup>{' '}
        <Spacer />{' '}
        <Flex alignItems={'center'} justifyItems={'stretch'}>
          <Text>
            {' '}
            <strong>
              {' '}
              {/*
                            For some reason, tanstack says the pagination object does not include pagecount when it does.                            Getpagecount doesn't work.                            Disabling typescript for now.                            */}
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </strong>
          </Text>{' '}
        </Flex>{' '}
        <Spacer />
        <Select
          maxW={'max-content'}
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50, 500].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </Select>
      </HStack>{' '}
      <HStack
        divider={
          <StackDivider h={'1rem'} alignSelf={'center'} borderColor="gray.200" />
        }
        spacing={4}
        align="center"
      >
        <Text>
          {' '}
          <strong>{table.getRowModel().rows.length}</strong> rows
        </Text>
        <ButtonGroup>
          {' '}
          <Button m={0} p={0} onClick={() => refreshData()} variant="ghost">
            Refresh Data
          </Button>
        </ButtonGroup>{' '}
      </HStack>{' '}
    </Stack>
  );
}

export default BasicReactTable;
