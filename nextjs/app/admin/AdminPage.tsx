'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { FaDollarSign, FaTrashAlt } from 'react-icons/fa';

import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';

import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Spacer,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { ColumnDef } from '@tanstack/react-table';
import { downloadZip } from '@/utils/formBuilder/downloadZip';
import { formatFinance } from '@/utils/finance';
import PieChart from '@/components/Charts/Pie';
import { BiDownArrow, BiUpArrow } from 'react-icons/bi';
import { BillingHandlerType, DelinquentAccount } from '@/utils/finance/getBilling';
import { formsType } from '@/types/formsType';
import financeFormat from '@/utils/finance/format';
import formatPhoneNumber from '@/utils/format/formatPhoneNumber';
import BasicReactTable from '@/components/table/Table';
import colors from '@/lib/colors';

export function Billing() {
  const toast = useToast();

  const [billing, setBilling] = useState<BillingHandlerType | undefined>(undefined);

  const [statements, setStatements] = useState<any>([]);

  const [accountsToClose, setAccountsToClose] = useState<string[]>([]);
  const [refetch, setRefetch] = useState<boolean>(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleClose = () => {
    setAccountsToClose([]);
    onClose();
  };

  useEffect(() => {
    fetch('/api/billing')
      .then((r) => r.json())
      .then((data) => {
        setBilling(data);
      });
  }, [refetch]);

  if (typeof billing === 'undefined') {
    return <div>Loading...</div>;
  }

  function handleCheckboxClick(id: string) {
    if (accountsToClose.includes(id)) {
      setAccountsToClose(accountsToClose.filter((a) => a !== id));
    } else {
      setAccountsToClose([...accountsToClose, id]);
    }
  }

  return (
    <Stack
      backdropBlur="md"
      borderRadius="lg"
      borderWidth="1px"
      p={4}
      spacing={4}
      w="full"
      justifyContent={'center'}
      alignItems={'center'}
    >
      <Heading>Billing</Heading>
      <ButtonGroup
        gap={4}
        w="max-content"
        // justifyContent={"center"}
        flexDirection={{ base: 'column', md: 'column' }}
      >
        <Button onClick={onOpen}>Show Accounts in Default</Button>
        <Button onClick={() => setRefetch(!refetch)}>Refresh</Button>
        <Button
          onClick={() => {
            fetch('/api/billing', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            })
              .then((r) => r.json())
              .then((data) => {
                const formData: formsType = [];
                Object.keys(data).forEach((key) => {
                  formData.push({
                    [`billing-${key}`]: data[key],
                  });
                });
                setStatements(formData);

                downloadZip(formData);
                toast({
                  title: 'Billing Generated',
                  description: 'Billing has been generated',
                  status: 'success',
                  duration: 9000,
                  isClosable: true,
                });
              });
          }}
        >
          Generate Statements
        </Button>
        {statements.length > 0 && (
          <Button
            w="full"
            onClick={() => {
              downloadZip(statements);
            }}
          >
            Download Statements
          </Button>
        )}
      </ButtonGroup>

      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={{ base: 2, md: 4 }}
        align={{ base: 'center', md: 'center' }}
        justifyItems="center"
        alignContent={{ base: 'center', md: 'center' }}
      >
        <Box
          w={{ base: 'full', md: '50%' }}
          h={{ base: 'full', md: '50%' }}
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          alignContent={'flex-end'}
        >
          <Text>
            {`
${billing.accountsInDefault.length} / ${
              billing.totalOpenAccounts
            } Accounts in Default (${Math.ceil(
              (billing.accountsInDefault.length / billing.totalOpenAccounts) * 100,
            )}%)
`}
          </Text>

          <Heading>Greatest Delinquent</Heading>
          {billing.greatestDelinquent.account && (
            <TableContainer>
              <Table>
                <Tr>
                  <Th>Account</Th>
                  <Th>Vehicle</Th>
                  <Th>Phone</Th>
                  <Th>Amount</Th>
                </Tr>
                <Tr>
                  <Td>
                    <Link
                      href={`/person?pid=${billing.greatestDelinquent.account.person.id}`}
                    >
                      {`${billing.greatestDelinquent.account.person.first_name} ${billing.greatestDelinquent.account.person.last_name}`}
                    </Link>
                  </Td>
                  <Td>
                    <Link
                      href={`/inventory?id=${billing.greatestDelinquent.vehicle?.id}`}
                    >
                      {billing.greatestDelinquent.vehicle?.display || 'No vehicle'}
                    </Link>
                  </Td>
                  <Td>{billing.greatestDelinquent.account.person.phone}</Td>
                  <Td>{billing.greatestDelinquent.delinquent}</Td>
                </Tr>
              </Table>
            </TableContainer>
          )}

          <Heading>This Month&#39;s Stats</Heading>
          <TableContainer>
            <Table>
              <Thead>
                <Tr>
                  <Th>Total Delinquent</Th>
                  <Th>Total Amount Expected</Th>
                  <Th>Expected This Month</Th>
                  <Th>Paid This Month</Th>
                  <Th>Accounts in Default</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td>
                    {formatFinance({
                      num: billing.totalDelinquent,
                      withoutCurrency: false,
                    })}
                  </Td>
                  <Td>
                    {formatFinance({
                      num: billing.totalAmountExpected,
                      withoutCurrency: false,
                    })}
                  </Td>
                  <Td>
                    {formatFinance({
                      num: billing.expectedThisMonth,
                      withoutCurrency: false,
                    })}
                  </Td>
                  <Td>
                    {formatFinance({
                      num: billing.paidThisMonth,
                      withoutCurrency: false,
                    })}
                  </Td>
                  <Td>{billing.accountsInDefault.length}</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
        <Box justifyContent={'center'} display={'flex'}>
          <PieChart
            data={{
              labels: ['Paid', 'Delinquent'],
              datasets: [
                {
                  label: 'Total',
                  data: [
                    billing.totalAmountExpected - billing.totalDelinquent,
                    billing.totalDelinquent,
                  ],
                  backgroundColor: ['hsl(120, 70%, 50%)', 'hsl(0, 70%, 50%)'],
                },
                {
                  label: 'This Month',
                  data: [
                    billing.paidThisMonth,
                    billing.expectedThisMonth - billing.paidThisMonth,
                  ],
                  backgroundColor: ['hsl(120, 70%, 50%)', 'hsl(0, 70%, 50%)'],
                },
              ],
            }}
            title="Delinquent - Total and This Month"
            options={{
              maintainAspectRatio: false,
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
                title: {
                  display: true,
                  text: 'Delinquent - Total and This Month',
                },
              },
            }}
          />
        </Box>
      </Stack>

      <Drawer size="full" isOpen={isOpen} onClose={handleClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <Stack w="full" direction={'row'}>
              <Heading>
                {billing.accountsInDefault.length} Accounts in Default
                <br />
                Total Delinquent:{' '}
                {formatFinance({
                  num: billing.totalDelinquent,
                  withoutCurrency: false,
                })}
              </Heading>
              <Spacer />
              <Button variant={'ghost'} onClick={onClose}>
                X
              </Button>
            </Stack>
          </DrawerHeader>
          <DrawerBody>
            <Grid
              templateColumns={{
                base: 'repeat(1, 1fr)',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
                xl: 'repeat(4, 1fr)',
              }}
              gap={6}
            >
              {billing.accountsInDefault.map((acc, n) => {
                return (
                  <GridItem key={'dgi-' + n} display={'flex'} gap={2}>
                    {/* <Stack
                      direction={{ base: "column", md: "row" }}
                      spacing={{ base: 2, md: 4 }}
                      align={{ base: "flex-start", md: "center" }}
                        inset={{ base: 2, md: 4 }}

                    > */}
                    {/* <Stack direction={'row'}> */}
                    <Checkbox
                      isChecked={accountsToClose.includes(acc.id)}
                      onChange={() => {
                        handleCheckboxClick(acc.id);
                      }}
                    />

                    <Stack>
                      <Stack
                        direction={'row'}
                        onClick={() => {
                          handleCheckboxClick(acc.id);
                        }}
                      >
                        <Heading as="h3" size="md">
                          {acc.account?.person.first_name}{' '}
                          {acc.account?.person.last_name}
                          <br />
                          {acc.vehicle?.display}
                          <br />
                          {acc.account?.person.phone}
                        </Heading>
                        <Spacer />
                      </Stack>
                      <Text>{acc.delinquent}</Text>
                    </Stack>
                    <Stack marginLeft={'auto'} marginBlock={'auto'} marginRight={0}>
                      <Link href={'/?filter=' + acc.id} passHref>
                        View Deal
                      </Link>
                      <Link href={'/person?pid=' + acc.account?.person.id} passHref>
                        View Account
                      </Link>
                    </Stack>
                  </GridItem>
                );
              })}
            </Grid>
          </DrawerBody>
          <DrawerFooter>
            <Button
              isDisabled={accountsToClose.length === 0}
              onClick={() => {
                fetch('/api/deals?close=' + accountsToClose.join(','), {
                  method: 'DELETE',
                }).then(async (r) => {
                  if (r.ok) {
                    r.json().then((_data) => {
                      setRefetch(!refetch);
                      handleClose();
                    });
                  } else {
                    throw new Error('Error closing accounts');
                  }
                });
              }}
              variant="solid"
              mr={3}
              leftIcon={<FaTrashAlt />}
            >
              Close Selected
            </Button>
            <Button variant="solid" mr={3} onClick={handleClose}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Stack>
  );
}

export function CreditApplications() {
  return null;
}

function StatCard({
  heading,
  headingLink,
  value,
  icon,
  iconColor,
  bottomText,
  bottomPercent,
}: {
  heading: string;
  headingLink?: string;
  value: number;
  icon?: 'up' | 'down' | 'dollar' | null;
  iconColor?: string;
  bottomText?: string;
  bottomPercent?: number;
}) {
  return (
    <Card>
      <Stack w={'full'} align="center">
        <Heading textAlign={'center'} size="md">
          {headingLink ? (
            <Link href={headingLink} passHref>
              {heading}
            </Link>
          ) : (
            heading
          )}
        </Heading>
        <Spacer />
        <Stack direction={'row'} align={'center'}>
          {icon && (
            <Icon
              marginRight={2}
              color={iconColor ? iconColor : icon === 'up' ? 'green' : 'red'}
              fontSize={'5xl'}
              as={
                icon === 'up'
                  ? BiUpArrow
                  : icon === 'dollar'
                  ? FaDollarSign
                  : BiDownArrow
              }
            />
          )}
          <Text
            fontWeight={'extrabold'}
            fontSize={'5xl'}
            display={'flex'}
            alignItems={'center'}
          >
            {value}
          </Text>
        </Stack>

        <Text
          fontSize={'lg'}
          textAlign={'center'}
          // color={'blackAlpha.500'}
          size="md"
        >
          <span
            style={{
              fontWeight: 'bolder',
            }}
          >
            {bottomPercent}
            {!bottomPercent || Number.isNaN(bottomPercent) ? '' : '%'}
          </span>{' '}
          {bottomText}
        </Text>
      </Stack>
    </Card>
  );
}

export function CardGrid({
  children,
  maxColumns,
}: {
  children: React.ReactNode;
  maxColumns?: number;
}) {
  return (
    <Grid
      templateColumns={{
        base: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(4, 1fr)',
        xl: `repeat(${maxColumns ? maxColumns : 4}, 1fr)`,
      }}
      gap={6}
    >
      {children}
    </Grid>
  );
}

export function AdminPage({ billing }: { billing: BillingHandlerType }) {
  // const [accountsToClose, setAccountsToClose] = useState<string[]>([]);
  const [carouselPosition, setCarouselPosition] = useState<number | 'all'>(3);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [statements, setStatements] = useState<formsType>([]);

  const toast = useToast();

  const columns = useMemo<ColumnDef<DelinquentAccount, any>[]>(
    () => [
      {
        header: 'Delinquent',
        footer: 'Delinquent',
        columns: [
          {
            header: 'Amount',
            accessorFn: (value) => value?.delinquent || 0,
            cell: (info) => (
              <Text color="red.500" textAlign={'right'}>
                {financeFormat({
                  num: info.getValue(),
                  withoutCurrency: true,
                })}
              </Text>
            ),
          },
        ],
      },
      {
        header: 'Account',
        footer: 'Account',
        columns: [
          {
            header: 'Name',
            accessorFn: (value) => value?.account?.person,
            cell: (info) => {
              return (
                <Link href={'/person?pid=' + info?.getValue().id} passHref>
                  {info?.getValue().first_name + ' ' + info?.getValue().last_name}
                </Link>
              );
            },
          },
          {
            header: 'Phone',
            accessorFn: (value) => value?.account?.person.phone,
            cell: (info) => formatPhoneNumber(info.getValue()) || 'Not recorded',
          },
          {
            header: 'Vehicle',
            footer: 'Vehicle',
            accessorFn: (value) => value?.vehicle?.display,
            cell: (info) => info.getValue() || 'Not recorded',
          },
        ],
      },
    ],
    [],
  );

  return (
    <Stack>
      <Heading>Dashboard</Heading>

      <CardGrid>
        <StatCard
          heading={'Accounts in Default'}
          value={billing?.accountsInDefault.length}
          icon={null}
          // bottomText="From Last 24 Hours"
          // bottomPercent={48}
        />
        <StatCard
          heading={'Total Delinquent'}
          value={+(billing?.totalDelinquent || 0).toFixed(0)}
          // icon={"up"}
          // bottomText="From Last 24 Hours"
          // bottomPercent={48}
        />
        <StatCard
          heading={'Total Open Accounts'}
          value={billing?.totalOpenAccounts}
          // icon={"down"}
          // bottomText="From Last 24 Hours"
          // bottomPercent={48}
        />
        {/* <StatCard
          heading={"Total Subs"}
          value={8952}
          icon={"up"}
          bottomText="From Last 24 Hours"
          bottomPercent={48}
        /> */}
        <Card>
          <Button
            colorScheme={'blue'}
            variant={'solid'}
            m={4}
            textTransform={'uppercase'}
            fontSize={'xl'}
            height={'full'}
            onClick={() => {
              fetch('/api/billing', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              })
                .then((r) => r.json())
                .then((data) => {
                  const formData: formsType = [];
                  Object.keys(data).forEach((key) => {
                    formData.push({
                      [`billing-${key}`]: data[key],
                    });
                  });
                  setStatements(formData);

                  downloadZip(formData);
                  toast({
                    title: 'Billing Generated',
                    description: 'Billing has been generated',
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                  });
                });
            }}
          >
            Generate Statements
          </Button>
          {/*<Button*/}
          {/*  onClick={() => {*/}
          {/*    fetch('/api/applications', {*/}
          {/*      method: 'POST',*/}
          {/*      headers: {*/}
          {/*        'Content-Type': 'application/json',*/}
          {/*      },*/}
          {/*    })*/}
          {/*      .then((r) => r.json())*/}
          {/*      .then((data) => {*/}
          {/*        console.log(data);*/}
          {/*      });*/}
          {/*  }}*/}
          {/*>*/}
          {/*  Manage Applications*/}
          {/*</Button>*/}
        </Card>
      </CardGrid>

      <Flex>
        <Button
          variant="outline"
          colorScheme="teal"
          marginBlock={4}
          onClick={() => {
            setShowTable(!showTable);
          }}
        >
          {showTable ? 'Show Carousel' : 'Show Table'}
        </Button>
        <Spacer />
        {!showTable && (
          <ButtonGroup variant="outline" colorScheme="teal" marginBlock={4}>
            <Button
              isDisabled={carouselPosition !== 'all' && carouselPosition <= 3}
              onClick={() => {
                setCarouselPosition(
                  carouselPosition !== 'all' ? carouselPosition - 3 : 3,
                );
              }}
            >
              Prev
            </Button>
            <Button
              isDisabled={
                carouselPosition === 'all' ||
                carouselPosition + 3 >= billing.accountsInDefault.length
              }
              onClick={() => {
                setCarouselPosition(
                  carouselPosition !== 'all' ? carouselPosition + 3 : 'all',
                );
              }}
            >
              Next
            </Button>
            <Button
              onClick={() => {
                setCarouselPosition(carouselPosition !== 'all' ? 'all' : 3);
              }}
            >
              All
            </Button>
          </ButtonGroup>
        )}
      </Flex>

      {showTable ? (
        <Card>
          <BasicReactTable
            resultsType={'Accounts In Default'}
            data={billing.accountsInDefault}
            columns={columns}
          />
        </Card>
      ) : (
        <Flex
          gap={4}
          direction={{
            base: 'column',
            md: 'row',
          }}
          maxW={'100vw'}
        >
          <Box flex={1} p={4}>
            {carouselPosition !== 'all' && carouselPosition > 0 ? (
              <CardGrid>
                {billing.accountsInDefault
                  .sort((a, b) => {
                    return (a.account?.person.last_name || '').localeCompare(
                      b.account?.person.last_name || '',
                    );
                  })
                  .slice(carouselPosition, carouselPosition + 8)
                  .map((acc, i) => {
                    return (
                      <StatCard
                        key={i}
                        heading={`${acc.account?.person.last_name}, ${acc.account?.person.first_name}`}
                        headingLink={`/person?aid=${acc.account?.person.id}`}
                        value={+acc.delinquent}
                        icon={'dollar'}
                        iconColor={'red'}
                        bottomText={acc.account?.person.phone}
                      />
                    );
                  })}
              </CardGrid>
            ) : (
              carouselPosition === 'all' && (
                <CardGrid>
                  {billing.accountsInDefault
                    .sort((a, b) => {
                      return (a.account?.person.last_name || '').localeCompare(
                        b.account?.person.last_name || '',
                      );
                    })
                    .map((acc, i) => {
                      return (
                        <StatCard
                          key={i}
                          heading={`${acc.account?.person.last_name}, ${acc.account?.person.first_name}`}
                          value={+acc.delinquent}
                          icon={'dollar'}
                          iconColor={'red'}
                          bottomText={acc.account?.person.phone}
                        />
                      );
                    })}
                </CardGrid>
              )
            )}
          </Box>
        </Flex>
      )}

      <Box flex={1}>
        <Card>
          <PieChart
            data={{
              labels: ['Paid', 'Delinquent'],
              datasets: [
                {
                  label: 'Total',
                  data: [
                    +(billing.totalAmountExpected - billing.totalDelinquent).toFixed(
                      2,
                    ),
                    billing.totalDelinquent,
                  ],
                  backgroundColor: [
                    colors.highContrast.primary,
                    colors.highContrast.secondary,
                  ],
                },
                {
                  label: 'This Month',
                  data: [
                    billing.paidThisMonth,
                    +(billing.expectedThisMonth - billing.paidThisMonth).toFixed(2),
                  ],
                  backgroundColor: [
                    colors.highContrast.primary,
                    colors.highContrast.secondary,
                  ],
                },
              ],
            }}
            title="Delinquent - Total and This Month"
            options={{
              maintainAspectRatio: false,
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
                title: {
                  display: true,
                  text: 'Delinquent - Total and This Month',
                },
              },
            }}
          />
        </Card>
      </Box>

      {/* <Tabs>
        <TabList>
          <Tab>Billing</Tab>
          <Tab>Credit Applications</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Billing />
          </TabPanel>
          <TabPanel>
            <CreditApplications />
          </TabPanel>
        </TabPanels>
      </Tabs> */}
    </Stack>
  );
}

export default AdminPage;
