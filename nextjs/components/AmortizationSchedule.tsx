import { Fragment, useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Heading,
  HStack,
  Spacer,
  Stack,
  StackDivider,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import formatDate from '@/utils/date/format';
import financeFormat from '@/utils/finance/format';
import { FinanceCalcResult, ParsedAmortizationSchedule } from '@/types/Schedule';
import { BusinessData } from '@/types/BusinessData';
import { print } from '@/utils/print';
import { datePlusMonths } from '@/utils/date';
import useSchedule from '@/hooks/useSchedule';

export function BusinessData({
  schedule,
  businessData,
  formType,
  display = true,
}: {
  schedule?: ParsedAmortizationSchedule;
  businessData?: BusinessData;
  formType?: string;
  display?: boolean;
}) {
  const business = businessData;

  if (!business) {
    return <p></p>;
  }

  return (
    <Stack display={display ? 'block' : 'none'}>
      <Text>
        <br />
        {business.businessName} | {business.phoneNumber}
        <br />
        {business.email}
        <br />
        {business.businessMotto}
        <br />
        <br />
        {business.address}
        <br />
        <br />
        {formatDate(new Date(), 'MMMM d, yyyy').toUpperCase()}
        <br />
        {formType
          ? formType
          : schedule?.hasHistory
          ? 'Payment History'
          : 'Amortization Schedule'}
      </Text>
      <Divider />
      <Text>
        {schedule?.hasHistory &&
          (schedule.paidToday || 0) > 0 &&
          'Thank you for your payment!'}
      </Text>
      <Divider />
      {schedule?.delinquentBalance && schedule?.delinquentBalance > 0 && (
        <Text>
          * The delinquent balance is calculated as the principal difference between
          the total expected at date minus the total amount paid.
        </Text>
      )}
    </Stack>
  );
}

export type DefaultAmortizationSchedule = {
  pmt: number;
  principal: number;
  annualRate: number;
  startDate: Date;
  numberOfPayments: number;
  finance: FinanceCalcResult;
};

function AmortizationSchedule({
  defaultSchedule: dSchedule,
  defaultSimple = true,
  id,
  withChart: defaultWithChart = false,
  defaultShow = false,
  defaultPrint = false,
  showBusinessData = true,
  chartId,
}: {
  defaultSchedule?: DefaultAmortizationSchedule;
  defaultSimple?: boolean;
  headerComponent?: JSX.Element;
  id?: string;
  withChart?: boolean;
  defaultShow: boolean;
  defaultPrint?: boolean;
  showBusinessData?: boolean;
  chartId?: string;
}) {
  const [showSchedule, setShowSchedule] = useState<boolean>(defaultShow);
  const [simple, setSimple] = useState<boolean>(defaultSimple);
  const schedule = useSchedule({
    dealId: id,
    defaultSchedule: dSchedule,
  });

  const [withZeroPayments, setWithZeroPayments] = useState<boolean>(false);

  const defaultSchedule = dSchedule;

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!schedule) {
      return;
    }

    if (defaultPrint) {
      const element = document.getElementById('print-button');

      if (!schedule) {
        console.log('No schedule to print');
        return;
      }

      if (schedule.hasHistory) {
        while (!document.getElementById('history-header')) {
          setTimeout(() => {
            console.log('Waiting for history header');
          }, 100);
        }
      } else {
        console.log('No history to wait for', schedule);
      }

      if (element) {
        element.click();
      } else {
        console.log('No print button');
      }
    }
  }, [defaultPrint, schedule]);

  const HistoryHeader = useMemo(() => {
    if (typeof document === 'undefined' || document?.readyState === 'loading') {
      setLoading(true);
      return <></>;
    }

    if (!schedule?.hasHistory) {
      console.log('No history', document.readyState);
      setLoading(false);
      return <></>;
    }

    return (
      <TableContainer id="history-header">
        <Table>
          <TableCaption placement={'top'}>
            <Stack
              py={6}
              borderBlock={'1px solid gray'}
              position={'relative'}
              // second border
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                transform: 'translateY(-100%)',
                zIndex: -1,
              }}
            >
              <Heading fontSize={'3xl'} textAlign={'center'} as="h1">
                {schedule.fullName?.toUpperCase()}
              </Heading>
            </Stack>

            <Heading fontSize={'2xl'} as="h2" textAlign={'center'} my={4}>
              {schedule.inventoryString?.toUpperCase()}
            </Heading>

            {/* <Text textAlign={"center"}>{receipt.inventory.vin}</Text> */}
          </TableCaption>
          {/* <Tr>
          <Divider borderColor="gray.500" borderWidth={1} />
          <Divider borderColor="gray.500" borderWidth={1} />
        </Tr> */}

          <Tr>
            <Th>Next Payment Date</Th>
            {(schedule?.delinquentBalance || 0) > 0 && <Th>Delinquent Balance *</Th>}
            <Th>Payment Amount</Th>
            <Th>Paid This Month</Th>
            <Th>Remaining Principal</Th>
          </Tr>
          <Tr h={'max-content'}>
            <Td>
              {formatDate(
                new Date(
                  new Date(schedule.startDate ?? new Date()).setMonth(
                    new Date().getMonth() + 1,
                  ),
                ) || new Date(),
                'MMMM d, yyyy',
              )}
            </Td>
            {(schedule?.delinquentBalance || 0) > 0 && (
              <Td>
                {financeFormat({
                  num: schedule.delinquentBalance,
                })}
              </Td>
            )}

            <Td>
              {financeFormat({
                num: schedule?.pmt,
              })}
            </Td>
            <Td>
              {financeFormat({
                num: schedule.paidToday,
              })}
            </Td>
            <Td>
              {financeFormat({
                num: (schedule?.principal ?? 0) - (schedule?.totalPaid ?? 0),
              })}
            </Td>
          </Tr>
        </Table>
        <Divider />
      </TableContainer>
    );
  }, [schedule]);

  return (
    <Stack
      direction={{
        base: 'column',
        md: 'row',
      }}
      spacing={4}
    >
      <Stack w={'min-content'} minW="50%" spacing={4}>
        <HStack>
          <Heading
            as={'h2'}
            alignItems={'center'}
            display={'inline-flex'}
            fontSize={'2xl'}
          >
            {schedule?.hasHistory ? 'Payment History' : 'Amortization Schedule'}
          </Heading>
          <Spacer />
          {/* <Box> */}
          <ButtonGroup>
            <Button
              isLoading={loading}
              variant={'outline'}
              onClick={() => setShowSchedule(!showSchedule)}
              type="button"
            >
              {showSchedule ? 'Hide' : 'Show'}
            </Button>
            <Button
              isLoading={loading}
              variant={'outline'}
              onClick={() => setSimple(!simple)}
              type="button"
            >
              {simple ? 'Detailed' : 'Simple'}
            </Button>
            <Button
              isLoading={loading}
              variant={'outline'}
              onClick={() => setWithZeroPayments(!withZeroPayments)}
              type="button"
            >
              {withZeroPayments ? 'Hide' : 'Show'} Zero Payments
            </Button>
            {/* Print */}
            <Button
              isLoading={loading}
              id="print-button"
              variant={'solid'}
              type="button"
              onClick={() => {
                const defShowSchedule = showSchedule;
                setShowSchedule(true);
                let printArr = ['amortization-schedule'];

                while (document.readyState !== 'complete') {
                  //   do nothing. Wait patiently.
                }

                if (defaultWithChart && chartId) {
                  printArr.push(chartId);
                }
                if (schedule?.hasHistory) {
                  printArr = ['history-header', ...printArr];
                }
                print({
                  elementId: printArr,
                  openNewWindow: !defaultPrint,
                });

                setShowSchedule(defShowSchedule);
              }}
            >
              Print
            </Button>
          </ButtonGroup>
        </HStack>
        <Box>
          {/* {headerComponent} */}

          {/* {headerComponent && (
          <Box mb={4} className={globals["print-only"]}>
            <Divider />
            </Box>
        )} */}
        </Box>
        {HistoryHeader}
        {showSchedule && (
          <TableContainer
            id="amortization-schedule"
            display={showSchedule ? 'block' : 'none'}
          >
            <Table w={'full'} variant="striped">
              <TableCaption>
                <Fragment>
                  <Text size="2xl">
                    {schedule?.hasHistory
                      ? 'Payment History'
                      : 'Amortization Schedule'}
                    <br />
                    {schedule?.startDate &&
                      formatDate(schedule?.startDate, 'b YYYY')}
                    {' - '}
                    {schedule?.endDate &&
                      formatDate(
                        new Date(
                          schedule.hasHistory
                            ? datePlusMonths(new Date(), 1)
                            : datePlusMonths(schedule?.endDate, 1),
                        ),
                        'b YYYY',
                      )}
                  </Text>
                  {schedule && !schedule.hasHistory && showBusinessData && (
                    <BusinessData schedule={schedule} />
                  )}

                  {!schedule?.hasHistory && (
                    <Fragment>
                      <HStack
                        display={'inline-flex'}
                        alignItems={'center'}
                        divider={<StackDivider borderColor="gray.200" />}
                      >
                        <Text>
                          Loan Amount:{' '}
                          {financeFormat({
                            num:
                              (schedule?.principal || 0) > 0
                                ? schedule?.principal
                                : defaultSchedule?.principal,
                          })}{' '}
                          &#8212; Term: {defaultSchedule?.numberOfPayments} months
                          &#8212; Interest Rate: {defaultSchedule?.annualRate}%
                        </Text>
                        {typeof schedule?.totalPaid === 'number' &&
                          schedule.totalPaid > 0 && (
                            <Text>
                              Total Paid:{' '}
                              {financeFormat({
                                num: schedule?.totalPaid,
                              })}
                            </Text>
                          )}
                      </HStack>
                    </Fragment>
                  )}
                </Fragment>
              </TableCaption>
              <Thead display={'table-header-group'}>
                <Tr>
                  {/* <Th>
                Pmt No.
              </Th> */}
                  {<Th>Month of</Th>}
                  {!simple && <Th>Beg</Th>}
                  {!schedule?.hasHistory ? <Th>Pmt</Th> : <Th>Expected</Th>}
                  {schedule?.hasHistory && <Th>Pmt</Th>}
                  {!simple && <Th>Princ</Th>}
                  {!simple && <Th>Int</Th>}
                  <Th>End</Th>
                </Tr>
              </Thead>
              <Tbody>
                {schedule &&
                  schedule.schedule?.map((row, bIndex: number) => (
                    <Fragment key={'btr-' + bIndex}>
                      {/*
                  TODO:
                  This is broken, because the grouping is off.
                  Need to fix this to show the year.
                  Priority: Low
                  */}
                      {/* <Tr>
                    <Td colSpan={8}>
                      <Text textAlign="center" fontWeight="bold">{`Year ${
                        schedule.schedule.length - bIndex
                      }`}</Text>
                    </Td>
                  </Tr> */}

                      {row
                        .filter((r) =>
                          withZeroPayments ? true : r.total && r.total > 0,
                        )
                        .map((schedulePart, index: number) => (
                          <Fragment key={index}>
                            <Tr>
                              {/* <Td>{schedulePart.i}</Td> */}
                              {<Td>{formatDate(schedulePart.date, 'b YYYY')}</Td>}
                              {!simple && (
                                <Td>
                                  {financeFormat({
                                    num: schedulePart.beginningBalance || 0,
                                  })}
                                </Td>
                              )}
                              <Td>
                                {financeFormat({
                                  num: schedulePart.expected || 0,
                                })}
                              </Td>
                              {schedule?.hasHistory && (
                                <Td
                                  color={
                                    schedulePart.total === 0
                                      ? 'none'
                                      : (schedulePart.total || 0) < schedule.pmt
                                      ? 'red.500'
                                      : 'green.500'
                                  }
                                >
                                  {financeFormat({
                                    num: schedulePart.total || 0,
                                  })}
                                </Td>
                              )}
                              {!simple && (
                                <Td>
                                  {financeFormat({
                                    num: schedulePart.principal || 0,
                                  })}
                                </Td>
                              )}
                              {!simple && (
                                <Td>
                                  {financeFormat({
                                    num: schedulePart.interest || 0,
                                  })}
                                </Td>
                              )}

                              <Td>
                                {financeFormat({
                                  num: schedulePart.balance || 0,
                                })}
                              </Td>
                            </Tr>
                            {schedulePart.payment.length > 1 && (
                              <Tr w={'min-content'}>
                                <Td colSpan={2} />
                                <Td colSpan={8}>
                                  Total of Payments:{' '}
                                  {
                                    <span>
                                      {schedulePart.payment.map((pmt, index) => {
                                        return (
                                          <Fragment key={index}>
                                            {financeFormat({
                                              num: pmt,
                                            })}
                                            {index <
                                              schedulePart.payment.length - 1 && (
                                              <span>, </span>
                                            )}
                                          </Fragment>
                                        );
                                      })}
                                    </span>
                                  }
                                </Td>
                              </Tr>
                            )}
                          </Fragment>
                        ))}
                    </Fragment>
                  ))}
              </Tbody>
            </Table>
            {schedule?.hasHistory && showBusinessData && (
              <>
                <Divider />
                <BusinessData schedule={schedule} />
              </>
            )}
          </TableContainer>
        )}
      </Stack>
      {/*{chartId && showSchedule && (*/}
      {/*  <StackedBarChart*/}
      {/*    title={`Amortization Schedule Chart`}*/}
      {/*    id={chartId}*/}
      {/*    data={{*/}
      {/*      // Labels are months*/}
      {/*      labels:*/}
      {/*        schedule?.schedule*/}
      {/*          ?.map((row) => {*/}
      {/*            const dates = row.map((r) => formatDate(r.date, 'b YYYY'));*/}
      {/*            return dates;*/}
      {/*          })*/}
      {/*          .reverse() || [],*/}
      {/*      datasets: [*/}
      {/*        {*/}
      {/*          label: 'Interest',*/}
      {/*          stack: 'Stack 0',*/}
      {/*          type: 'bar',*/}
      {/*          data: collapseArray(*/}
      {/*            schedule?.schedule?.map((row) => {*/}
      {/*              const interest = row.map((r) => r.interest);*/}
      {/*              return interest.map((p) => Math.round(p * 100) / 100);*/}
      {/*            }) || [],*/}
      {/*          ).reverse(),*/}
      {/*          backgroundColor: colors.highContrast.primary,*/}
      {/*          order: 1,*/}
      {/*        },*/}
      {/*        {*/}
      {/*          label: 'Principal',*/}
      {/*          stack: 'Stack 0',*/}
      {/*          type: 'bar',*/}
      {/*          data: collapseArray(*/}
      {/*            schedule?.schedule?.map((row) => {*/}
      {/*              const principal = row.map((r) => r.principal);*/}
      {/*              // Round to 2 decimal places*/}
      {/*              return principal.map((p) => Math.round(p * 100) / 100);*/}
      {/*            }) || [],*/}
      {/*          ).reverse(),*/}
      {/*          backgroundColor: colors.highContrast.quaternary,*/}
      {/*          order: 1,*/}
      {/*        },*/}
      {/*        {*/}
      {/*          label: 'Balance',*/}
      {/*          type: 'Line' as ChartType,*/}
      {/*          data: collapseArray(*/}
      {/*            schedule?.schedule?.map((row) => {*/}
      {/*              const balance = row.map((r) => r.balance || 0);*/}
      {/*              return balance.map((p) => Math.round(p * 100) / 100);*/}
      {/*            }) || [],*/}
      {/*          ).reverse(),*/}
      {/*          backgroundColor: colors.highContrast.tertiary,*/}
      {/*          borderColor: colors.highContrast.tertiary,*/}
      {/*          yAxisID: 'axis-time',*/}
      {/*          width: 2,*/}
      {/*          z: 1,*/}
      {/*          fill: false,*/}
      {/*          overlayBars: true,*/}
      {/*          order: 0,*/}
      {/*        },*/}
      {/*      ],*/}
      {/*    }}*/}
      {/*  />*/}
      {/*)}*/}
    </Stack>
  );
}

export default AmortizationSchedule;
