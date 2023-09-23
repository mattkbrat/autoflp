'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaFileDownload } from 'react-icons/fa';
import { print } from '@/utils/print';

import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  InputGroup,
  InputRightAddon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Stack,
  Tab,
  Table,
  TableCaption,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import isDev from '@/lib/isDev';
import AmortizationSchedule from '@/components/AmortizationSchedule';
import { Deal } from '@/types/prisma/deals';
import { FinanceCalcResult, FinanceCalcResultKeys } from '@/types/Schedule';
import { datePlusMonths } from '@/utils/date';
import financeCalc from '@/utils/finance/calc';
import roundToPenny from '@/utils/finance/roundToPenny';
import globals from 'styles/globals.module.css';
import PersonSelector from '@/components/selects/PersonSelector';
import InventoryCard from '@/components/display/InventoryCard';
import CurrencyInput from '@/components/Inputs/CurrencyInput';
import { PercentageInput } from '@/components/Inputs/PercentageInput';
import financeFormat from '@/utils/finance/format';
import PieChart from '@/components/Charts/Pie';
import colors from '@/lib/colors';
import FormWrap from '@/components/FormWrap';
import AlertDialog from '@/components/AlertDialog';
import AccountCard from '@/components/display/AccountCard';
import InventorySelector from '../selects/InventorySelector';
import { PersonCreditor } from '@/types/prisma/person';
import { downloadZip } from '@/utils/formBuilder/downloadZip';
import { Form } from '@/types/forms';
import PersonCard from '@/components/display/PersonCard';
import formatInventory from '@/utils/format/formatInventory';
import { TextInput } from '@/components/Inputs/TextInput';
import { BusinessData } from '@/types/BusinessData';
import StackWrap from '../StackWrap';

// const debug = isDev;
const debug = false && isDev; // Never have debug in production

const defaultSaleType: 'cash' | 'credit' = 'credit';

const defaultChanges = {
  tax_city: '0',
  tax_rtd: '0',
  tax_county: '0',
  tax_state: '2.9',
  filing_fees: '0',
  down: '0',
  downOwed: 0,
  totalCost: 0,
  sale_type: defaultSaleType,
  term: '12',
  date: new Date().toISOString().split('T')[0],
  salesman: '',
  trade_value: 0,
  cosigner: '',
};

/**
 * This page will be rendered at /deal
 * It will feature a list of accounts, and a form to add a new account
 * It will also feature a list of creditors, and a form to add a new creditor
 * It will also feature a list of inventory, and a form to add a new inventory
 * For the form itself, it will be a modal with the inputs for term, down payment, and selling price
 * The selling price will be calculated from the inventory price, and the term and down payment
 * @returns JSX.Element
 */
export function DealForm(props: { id: string; businessData: BusinessData }) {
  const [changes, setChanges] = useState<
    Partial<Deal> & {
      downOwed: number;
      sale_type: 'cash' | 'credit';
      salesman: string;
      trade_value: number;
      filing_fees: string;
      totalCost: number;
      cosigner: string | null;
    }
  >({ ...defaultChanges, id: props.id });

  const isCredit = useMemo(() => {
    return changes.sale_type === 'credit';
  }, [changes.sale_type]);

  const [aid, setAid] = useState<string | null>(null); // account id
  const [pid, setPid] = useState<string | null>(null); // person id
  const [iid, setIid] = useState<string | number | null>(null); // inventory id
  const [cid, setCid] = useState<string | null>(null); // Creditor ID
  const [sid, setSid] = useState<string | null>(null); // Salesperson ID

  const [inventoryState, setInventoryState] = useState(1);

  const [calculatedFinance, setCalculatedFinance] =
    useState<FinanceCalcResult | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [message, setMessage] = useState<string | null>(null);

  // useEffect(() => {
  //   if (showAlert) {
  //     onOpen();
  //   } else {
  //     onClose();
  //   }
  // }, [showAlert]);

  const [forms, setForms] = useState<Form[]>([]); // Form data

  const [trades, setTrades] = useState<
    {
      make?: string;
      model?: string;
      year?: string;
      vin?: string;
      value?: number;
      isFetching?: boolean;
      isInvalid?: boolean;
    }[]
  >([]);

  const fetchTrade = useCallback((index: number) => {
    const thisTrade = trades[index];
    if (thisTrade.isFetching) return
    setTrades([
      ...trades.slice(0, index),
      {
        ...thisTrade,
        isFetching: true,
      },
      ...trades.slice(index + 1),
    ]);
    fetch(`/api/inventory/${trades[index].vin}/vin`).then(
      async (res) => {
        const data = await res.json();
        if (data.error) {
          setMessage(data.error);
        } else {
          // Update trades object
          const newTrades = [...trades];
          newTrades[index].make = data.vin.make;
          newTrades[index].model = data.vin.model;
          newTrades[index].year = data.vin.year;
          newTrades[index].isFetching = false;
          setTrades(newTrades);
        }
      },
    );
  }, [trades]);

  useEffect(() => {
    // for (const trade of trades) {
    //   if (!trade.make && trade.vin && trade.vin.length === 17) {
    //     fetchTrade(trades.indexOf(trade));
    //   }
    // }

    const newTrades = trades;

    newTrades.forEach((trade, i) => {
      if (!trade.vin || trade.vin.length !== 17) {
        trade.isInvalid = true
        return
      } else {
        const vinCount = newTrades.filter(v => v.vin === trade.vin).length
        trade.isInvalid = vinCount > 1
      }
      
      if (!trade.isInvalid && !trade.make){
        fetchTrade(i)
        return
      }
    });

    setTrades(newTrades)
  }, [trades]);

  const [inventoryPrices, setInventoryPrices] = useState<{
    selling?: number;
    credit?: number;
    cash?: number;
    down: number;
  }>({
    selling: 0,
    down: 0,
  });


  const toast = useToast();

  useEffect(() => {
    message &&
      toast({
        title: message,
        status: message.toLowerCase().includes('error') ? 'error' : 'info',
        duration: 5000,
        isClosable: true,
      });
  }, [message, toast]);

  // const MemoizedSchedule = useMemo(() => {
  //   if (!calculatedFinance || changes.sale_type !== "credit") {
  //     return <></>;
  //   }

  //   return (
  //     <AmortizationSchedule
  //       defaultSchedule={{
  //         principal: +(changes.totalLoanAmount ?? 0),
  //         startDate:
  //           typeof changes.date === "string"
  //             ? new Date(changes.date)
  //             : new Date(),
  //         numberOfPayments: +changes.term ?? 0,
  //         annualRate: +changes.apr ?? 0,
  //         pmt: +changes.monthlyPayment ?? 0,
  //         finance: calculatedFinance,
  //       }}
  //       defaultShow={true}
  //       withChart={true}
  //     />
  //   );
  // }, [
  //   changes.apr,
  //   changes.selling_value,
  //   changes.term,
  //   changes.date,
  //   changes.totalLoanAmount,
  //   changes.monthlyPayment,
  //   calculatedFinance,
  // ]);

  useEffect(() => {
    const newChanges = changes;
    if (aid) {
      newChanges.account = aid;
    }
    if (iid) {
      newChanges.inventoryId = iid.toString();
    }
    if (sid) {
      newChanges.salesman = sid;
    }

    if (JSON.stringify(newChanges) !== JSON.stringify(changes)) {
      setChanges(newChanges);
    }
  }, [changes, aid, iid, sid]);

  useEffect(() => {
    if (!cid) {
      return;
    }

    const cid_split = cid.split(':');
    setChanges((changes) => ({
      ...changes,
      creditor: cid_split[0],
      filing_fees: cid_split[1],
      apr: cid_split[2],
    }));
  }, [cid, setChanges]);

  useEffect(() => {
    const creditIsNumber = inventoryPrices?.credit && inventoryPrices.credit > 0;

    const selling_value =
      isCredit && creditIsNumber ? inventoryPrices.credit : inventoryPrices.cash;

    setChanges({
      ...changes,
      cash: (selling_value || 0).toFixed(2),
      down: (inventoryPrices.down || 0).toFixed(2),
    });
  }, [changes.sale_type, inventoryPrices, isCredit]);

  useEffect(() => {
    const totalTradeValue = trades.reduce((acc, trade) => {
      return acc + (trade.value ?? 0);
    }, 0);

    setChanges({
      ...changes,
      trade_value: totalTradeValue,
    });
  }, [trades]);

  useEffect(() => {
    if (changes.sale_type === 'credit' && changes.term === '0') {
      console.log('changes.term', changes.term);
      setChanges({
        ...changes,
        sale_type: 'cash',
      });
    }

    // Keep the down owed updated

    const newDownOwed = Math.min(+changes.downOwed, +inventoryPrices.down);
    if (newDownOwed !== +changes.downOwed) {
      console.log('newDownOwed', newDownOwed);
      setChanges({
        ...changes,
        downOwed: newDownOwed,
      });
    }

    if (!inventoryPrices.selling || Number.isNaN(+inventoryPrices.selling)) {
      return;
    }

    const sellingValue = +inventoryPrices.selling;
    const tradeValue = +changes.trade_value;
    let totalTaxPercent =
      // (+(changes.tax_city || 0) +
      // +changes.tax_county +
      // +changes.tax_rtd +
      // +changes.tax_state) /
      // 100;
      (Number(changes.tax_state || 0) +
      Number(changes.tax_city || 0) +
      Number(changes.tax_county || 0) +
      Number(changes.tax_rtd || 0)) / 100;
    totalTaxPercent = Math.round(totalTaxPercent * 1000) / 1000;
    const totalValue = (sellingValue - tradeValue) * (1 + totalTaxPercent);

    if (changes.sale_type === 'cash' && inventoryPrices.down.toFixed(2) !== totalValue.toFixed(2)) {
      console.log('changes.sale_type', changes.sale_type);
      setChanges({
        ...changes,
        down: totalValue.toFixed(2),
      });
      setInventoryPrices({
        ...inventoryPrices,
        down: totalValue,
      });
    }

    // if ((+changes.selling_value) < (+changes.down) + (+changes.trade_value)) {
    //   setChanges({
    //     ...changes,
    //     term: 0,
    //     sale_type: "cash",
    //   });
    // } else {
    //   setChanges({
    //     ...changes,
    //     term: 12,
    //     sale_type: "credit",
    //   });
    // }
  }, [changes, inventoryPrices]);

  useEffect(() => {
    const date = changes.date;
    if (!inventoryPrices.selling || typeof date !== 'string') {
      return;
    }

    const firstPaymentDate = datePlusMonths(date, 1);

    const finance: FinanceCalcResult = financeCalc({
      tax: {
        city: Number(changes.tax_city || 0),
        rtd: Number(changes.tax_rtd || 0),
        state: Number(changes.tax_state || 0),
        county: Number(changes.tax_county || 0),
      },
      prices: {
        selling: Number.isNaN(+inventoryPrices.selling)
          ? 0
          : +inventoryPrices.selling,
        down: Number.isNaN(+inventoryPrices.down) ? 0 : +inventoryPrices.down,
        trade: Number.isNaN(+changes.trade_value) ? 0 : +changes.trade_value, // TODO: add trade value to the form
      },
      creditor: {
        term: Number(changes.term || 12),
        filingFees: Number(changes.filing_fees || 0),
        apr: Number(changes.apr || 0),
      },
      firstPayment: new Date(firstPaymentDate),
    });

    if (calculatedFinance?.totalCost !== finance.totalCost) {
      setCalculatedFinance(finance);
      setChanges({
        ...changes,
        ...finance,
      });
    }
  }, [
    inventoryPrices,
    changes.term,
    changes.filing_fees,
    changes.apr,
    changes.tax_city,
    changes.tax_rtd,
    changes.tax_state,
    changes.tax_county,
    changes.trade_value,
    changes.date,
    changes,
  ]);

  const AboutDeal = (props: {
    direction?: { base: 'column' | 'row'; lg: 'column' | 'row' };
  }) => {
    if (!calculatedFinance) {
      return <></>;
    }

    const direction = props.direction || { base: 'column', lg: 'row' };

    const metrics = [
      'cashBalanceIncludingTax',
      'totalTaxDollar',
      'lastPaymentDueDate',
      'lastPayment',
      'monthlyPayment',
      'totalLoanAmount',
    ] as FinanceCalcResultKeys;

    return (
      <Stack
        spacing={{ base: 4, md: 10 }}
        direction={direction}
        // spacing={{ base: 0, md: 4 }}
        w={'100%'}
        justifyContent={'space-between'}
      >
        {metrics.map((metric) => {
          if (!Object.keys(calculatedFinance).includes(metric)) {
            return <></>;
          }

          const firstCapitalIndex = metric.search(/[A-Z]/);
          // Split at capital
          let metricName: string = metric;
          if (firstCapitalIndex !== -1) {
            metricName =
              metric.slice(0, firstCapitalIndex) +
              ' ' +
              metric.slice(firstCapitalIndex);
          }
          metricName = metricName.replaceAll('_', ' ').toUpperCase();

          return (
            <Flex direction={'column'} key={metric} w={{ base: '100%', md: 'auto' }}>
              <Text
                fontSize={'md'}
                fontWeight={'bold'}
                color={'gray.500'}
                textAlign={'center'}
              >
                {metricName}
              </Text>
              <Text fontSize={'lg'} fontWeight={'bold'} textAlign={'center'}>
                {roundToPenny(calculatedFinance[metric])}
              </Text>
            </Flex>
          );
        })}
      </Stack>
    );
  };

  function performPrechecks() {
    const errors = [];

    if (
      (typeof changes.apr === 'undefined' && changes.sale_type === 'credit') ||
      (changes.sale_type === 'credit' && typeof changes.creditor !== 'string')
    ) {
      errors.push('Creditor required.');
    }

    if (typeof changes.date !== 'string') {
      errors.push('Date required.');
    }

    if (typeof changes.account !== 'string' || changes.account.length === 0) {
      errors.push('Account required.');
    }

    if (!changes.inventoryId) {
      if (typeof iid === 'undefined' || iid === null) {
        errors.push('Selling vehicle required.');
      } else {
        setChanges({
          ...changes,
          inventoryId: iid.toString(),
        });
      }
    }

    if (inventoryPrices.selling <= 0) {
      console.log('changes.totalCost', changes.totalCost);
      errors.push('Selling value required.');
    }

    if (
      typeof changes.salesman === 'undefined' ||
      changes.salesman === '' ||
      sid === null
    ) {
      errors.push('Salesman required.');
    }

    // if (changes.totalCost < (+changes.down || 0) + (+changes.trade_value || 0)) {
    //   errors.push("Down payment plus trade cannot exceed selling value.");
    // }

    if (errors.length > 0) {
      if (errors.length > 1) {
        setMessage('Errors: ' + errors.join(' '));
      } else {
        setMessage('Error: ' + errors[0]);
      }
      return false;
    }

    return true;
  }

  function handleSubmit() {
    // e.preventDefault();

    // Create vehicles for trade ins
    const tradeVehicles = trades.map((trade) => {
      return {
        vin: trade.vin,
        year: trade.year,
        make: trade.make,
        model: trade.model,
        cash: trade.value,
      };
    });

    // const monthlyPayment = +changes.monthlyPayment || 0;
    // const finance = +changes.totalLoanAmount;
    const apr = Number(changes.apr || 0);

    if (!calculatedFinance) {
      setMessage('Error: Could not calculate finance.');
      return;
    }

    const body: Deal & {
      cosigner: string;
    } = {
      id: changes.id || '',
      state: changes.sale_type === 'credit' ? 1 : 0,
      // match format yyyy-mm-dd
      date: changes.date as string,
      account: changes.account as string,
      inventoryId: changes.inventoryId as string,
      creditor: changes.sale_type === 'credit' ? (changes.creditor as string) : null,
      cash: inventoryPrices.selling.toString(),
      down: (inventoryPrices.down || 0).toString(),
      apr: apr.toFixed(2),
      finance: calculatedFinance.financeAmount.toFixed(2),
      lien: (changes.sale_type === 'credit'
        ? calculatedFinance.totalLoanAmount
        : 0
      ).toFixed(2),
      pmt: calculatedFinance.monthlyPayment.toFixed(2),
      term: (changes.term || 0).toString(),
      tax_state: (+(changes.tax_state || 0)).toFixed(2),
      tax_city: (+(changes.tax_city || 0)).toFixed(2),
      tax_rtd: (+(changes.tax_rtd || 0)).toFixed(2),
      tax_county: (+(changes.tax_county || 0)).toFixed(2),
      cosigner: changes.cosigner || null,
    };

    // console.table({ body })
    fetch('/api/deal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body, salesman: changes.salesman, tradeVehicles }),
    }).then(
      (res) => {
        if (res.status === 200) {
          res.json().then((data) => {
            console.log('Complete', data);
            if (typeof data.forms !== 'undefined') {
              const fetchedForms: any[] = data.forms;

              const filteredForms = fetchedForms.filter((form) => {
                const formName = Object.values(form)[0];

                if (typeof formName !== 'string') {
                  return false;
                }

                return formName.includes('.pdf');
              });

              setForms(filteredForms);
              downloadZip(filteredForms);

              ({ filteredForms });
            }

            data?.deal?.id && setChanges({ ...changes, id: data.deal.id });
            setMessage(`Success: ${data.message}`);
          });
        } else {
          res.json().then((data) => {
            setMessage({
              ...data,
            });
          });
        }
      },
      (err) => {
        if (typeof err.error === 'string') {
          setMessage(err.error);
        } else {
          setMessage(err);
        }
      },
    );


    onClose();
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!performPrechecks()) {
      return;
    }
    // setMessage("");
    // if (performPrechecks() === false) {
    //   return;
    // }

    onOpen();
  };

  return (
    <StackWrap>
      {isOpen && (
        <AlertDialog
          size={'6xl'}
          isOpen={true}
          onClose={onClose}
          handleConfirm={handleSubmit}
        >
          <Stack>
            <Grid
              // Two columns with footer
              templateColumns={'1fr auto'}
              templateRows={'1fr auto'}
            >
              <Stack id="aboutDeal">
                <Heading
                  background={'green.600'}
                  color={'white'}
                  fontWeight={'bold'}
                  py={2}
                  px={4}
                  outline={'2px solid green.200'}
                >
                  Monthly Pay:&ensp;{' '}
                  {financeFormat({
                    num: +(calculatedFinance?.monthlyPayment || 0),
                    withoutCurrency: false,
                  })}
                </Heading>
                <Divider />
                <Text fontWeight={'bold'} fontSize={'xl'}>
                  About Deal
                </Text>
                <Table variant="simple" size={'lg'}>
                  <TableCaption>Summary of the deal</TableCaption>
                  <Thead>
                    <Tr>
                      <Th>Item</Th>
                      <Th isNumeric>Value</Th>
                    </Tr>
                  </Thead>
                  {/*
                Total Loan Amount,
                Sale Tax,
                Other Fees,
                Upfront Payment,

                Total of xx Loan Payments,
                Total Loan Interest,
                Total Loan Cost,
                */}
                  <Tbody>
                    <Tr>
                      <Td fontSize={'xl'}>Total Loan Amount (Finance)</Td>
                      <Td fontSize={'xl'} isNumeric>
                        {financeFormat({
                          num: +(calculatedFinance?.financeAmount || 0),
                          withoutCurrency: false,
                        })}
                      </Td>
                    </Tr>
                    <Tr>
                      <Td fontSize={'lg'}>Sale Tax</Td>
                      <Td fontSize={'lg'} isNumeric>
                        {financeFormat({
                          num: +(calculatedFinance?.totalTaxDollar || 0),
                        })}
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>Other Fees</Td>
                      <Td isNumeric>
                        {financeFormat({ num: +(changes?.filing_fees || 0) })}
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>Upfront Payment</Td>
                      <Td isNumeric>
                        {financeFormat({ num: +(inventoryPrices.down || 0) })}
                      </Td>
                    </Tr>
                    <Tr>
                      <Td></Td>
                      <Td></Td>
                    </Tr>
                    <Tr>
                      <Td>{`Total of ${changes.term} Loan Payments`}</Td>
                      <Td isNumeric>
                        {financeFormat({
                          num: +(calculatedFinance?.totalLoanAmount || 0),
                        })}
                      </Td>
                    </Tr>
                    <Tr>
                      <Td>Total Loan Interest</Td>
                      <Td isNumeric>
                        {financeFormat({
                          num: +(calculatedFinance?.deferredPayment || 0),
                        })}
                      </Td>
                    </Tr>
                    <Tr>
                      <Td fontSize={'2xl'}>Total Loan Cost</Td>
                      <Td fontSize={'2xl'} isNumeric>
                        {financeFormat({
                          num: +(calculatedFinance?.totalCost || 0),
                          withoutCurrency: false,
                        })}
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Stack>
              <PieChart
                title={`Total Loan: ${+(calculatedFinance?.totalCost || 0)?.toFixed(
                  2,
                )}`}
                data={{
                  // selling + totalTaxDollar + filingFees + deferredPayment;
                  labels: ['Auto Price', 'Tax', 'Charges', 'Interest'],
                  datasets: [
                    {
                      label: 'Option 1',
                      data: [
                        +inventoryPrices.selling.toFixed(2),
                        +(calculatedFinance?.totalTaxDollar || 0).toFixed(2),
                        +(changes?.filing_fees || 0),
                        +(calculatedFinance?.deferredPayment || 0).toFixed(2),
                      ],
                      backgroundColor: [
                        colors.highContrast.primary,
                        colors.highContrast.secondary,
                        colors.highContrast.tertiary,
                        colors.highContrast.quaternary,
                      ],
                    },
                  ],
                }}
              />

              <Box gridColumn={'1 / -1'}>
                {/* {MemoizedSchedule} */}
                {/* <RenderAmortizationSchedule chartId='printable-schedule'/> */}
                {changes.sale_type === 'credit' && !!calculatedFinance && (
                  <AmortizationSchedule
                    businessData={props.businessData}
                    defaultSchedule={{
                      principal: +(changes.totalCost ?? 0),
                      startDate:
                        typeof changes.date === 'string'
                          ? new Date(changes.date)
                          : new Date(),
                      numberOfPayments: +(changes.term || 0),
                      annualRate: +(changes.apr || 0),
                      pmt: +(calculatedFinance.monthlyPayment || 0),
                      finance: calculatedFinance,
                    }}
                    defaultShow={false}
                    withChart={true}
                    chartId={'deal-finance-chart'}
                  />
                )}
              </Box>
            </Grid>
            <ButtonGroup>
              <Button
                w="full"
                onClick={() => {
                  onClose();
                  handleSubmit();
                }}
              >
                Confirm
              </Button>
              <Button
                w="full"
                onClick={() => {
                  const printArr = [
                    'aboutDeal',
                    'amortization-schedule',
                    'printableStackedBar',
                    'myChart',
                  ];
                  print({
                    elementId: printArr,
                  });
                }}
              >
                Print
              </Button>
            </ButtonGroup>
          </Stack>
        </AlertDialog>
      )}

      <Heading>{changes.sale_type === 'credit' ? 'Credit' : 'Cash'} Deal</Heading>
      <Stack as={'form'} onSubmit={onSubmit}>
        <Box className={globals.no_print}>
          <Stack spacing={{ base: 0, md: 4 }}>
            {debug && (
              <pre>
                {JSON.stringify(
                  {
                    changes,
                    inventoryPrices,
                    trades,
                    cid,
                    sid,
                  },
                  null,
                  2,
                )}
              </pre>
            )}

            <Stack
              direction={{ base: 'column', md: 'row' }}
              spacing={{ base: 0, md: 4 }}
            >
              <Tooltip
                label={`Toggle ${
                  changes.sale_type === 'credit' ? 'cash' : 'credit'
                } sale`}
              >
                <Button
                  px={6}
                  onClick={() => {
                    setChanges({
                      ...changes,
                      term: (changes.sale_type === 'credit' ? 0 : 12).toFixed(0),
                      sale_type: changes.sale_type === 'credit' ? 'cash' : 'credit',
                      creditor: '',
                      apr: '0',
                      filing_fees: '0.00',
                    });

                    setCid('');
                  }}
                >
                  {changes.sale_type === 'credit' ? 'Credit' : 'Cash'}
                </Button>
              </Tooltip>

              <PersonSelector
                setPid={setPid}
                setAid={setAid}
                filter="account"
                pid={pid}
              />
            </Stack>

            {aid && (
              <Stack
                direction={{
                  base: 'column',
                  md: 'row',
                }}
                w={'full'}
                justifyContent={'center'}
              >
                {aid && <AccountCard id={aid} />}
                {pid && <PersonCard id={pid} />}
              </Stack>
            )}

            <TextInput
              name="cosigner"
              label="Cosigner"
              changes={changes}
              setChanges={setChanges}
            />

            <Divider />

            <Flex alignItems={'center'}>
              <Stack
                direction={{
                  base: 'column',
                  md: 'row-reverse',
                }}
                alignItems={'center'}
                spacing={{ base: 0, md: 4 }}
                justifyItems={'center'}
              >
                <InventorySelector
                  setPrices={(e) => {
                    setInventoryPrices(e);
                    console.info('Got prices', e);
                  }}
                  setSelected={setIid}
                  selected={iid || ''}
                  state={inventoryState}
                />
                <Button
                  colorScheme={'blue'}
                  variant={'outline'}
                  onClick={() => setInventoryState(inventoryState === 0 ? 1 : 0)}
                >
                  {inventoryState === 0 ? 'Current Inventory' : 'All Inventory'}
                </Button>
              </Stack>
              <InventoryCard
                simple={true}
                withAccounts={false}
                inventoryID={iid as string}
              />
            </Flex>

            <Divider />

            <Stack spacing={{ base: 4, md: 6 }}>
              <Stack
                direction={{ base: 'column', md: 'row' }}
                spacing={{ base: 0, md: 4 }}
                alignItems="center"
              >
                {/* TODO: Selling value not updating between credit/cash deals */}
                <CurrencyInput
                  formLabel="Selling Value"
                  name={+(inventoryPrices?.selling ?? 0)}
                  onChange={(_valueAsString, valueAsNumber) =>
                    setInventoryPrices({
                      ...inventoryPrices,
                      selling: valueAsNumber,
                    })
                  }
                />
                <CurrencyInput
                  isDisabled={
                    changes.sale_type === 'cash' ||
                    !inventoryPrices.selling ||
                    +inventoryPrices.selling === 0
                  }
                  formLabel="Down Payment"
                  max={+(inventoryPrices.selling || 0) + (+changes.saleTax || 0)}
                  name={+(inventoryPrices.down ?? 0)}
                  tooltip={{
                    label: 'This is the total amount due for this cash deal.',
                    position: 'top',
                    disabled: changes.sale_type === 'credit',
                  }}
                  onChange={(_valueAsString, valueAsNumber) =>
                    setInventoryPrices({ ...inventoryPrices, down: valueAsNumber })
                  }
                />
                <CurrencyInput
                  formLabel="Owed On Down"
                  max={+inventoryPrices.down}
                  name={+changes.downOwed ?? 0}
                  onChange={(_valueAsString, valueAsNumber) =>
                    setChanges({ ...changes, downOwed: valueAsNumber })
                  }
                />
                {changes.sale_type === 'credit' && (
                  <FormControl
                    isRequired
                    w={{ base: '30%', md: '100%', sm: '100%', xs: '100%' }}
                  >
                    <FormLabel>Term</FormLabel>
                    <InputGroup>
                      <NumberInput
                        w={'full'}
                        defaultValue={0}
                        value={+changes.term}
                        min={0}
                        max={changes.sale_type === 'credit' ? 84 : 0}
                        keepWithinRange
                        onChange={(_valueAsString, valueAsNumber) => {
                          if (valueAsNumber === 0) {
                            setChanges({
                              ...changes,
                              sale_type: 'cash',
                              term: 0,
                            });
                          } else {
                            setChanges({ ...changes, term: valueAsNumber });
                          }
                        }}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <InputRightAddon
                        bg={'none'}
                        border={'none'}
                        cursor={'default'}
                        userSelect={'none'}
                      >
                        Months
                      </InputRightAddon>
                    </InputGroup>
                  </FormControl>
                )}
              </Stack>
              <Stack
                direction={{ base: 'column', md: 'row' }}
                spacing={{ base: 0, md: 4 }}
              >
                <PercentageInput
                  formLabel="State Tax"
                  name={+(changes.tax_state ?? 0)}
                  onChange={(_valueAsString, valueAsNumber) =>
                    setChanges({ ...changes, tax_state: _valueAsString })
                  }
                />
                <PercentageInput
                  formLabel="City Tax"
                  name={+(changes.tax_city ?? 0)}
                  onChange={(_valueAsString, valueAsNumber) =>
                    setChanges({ ...changes, tax_city: _valueAsString })
                  }
                />
                <PercentageInput
                  formLabel="RTD Tax"
                  name={+(changes.tax_rtd ?? 0)}
                  onChange={(_valueAsString, valueAsNumber) =>
                    setChanges({ ...changes, tax_rtd: _valueAsString })
                  }
                />
                <PercentageInput
                  formLabel="County Tax"
                  name={+(changes.tax_county ?? 0)}
                  onChange={(_valueAsString, valueAsNumber) =>
                    setChanges({ ...changes, tax_county: _valueAsString })
                  }
                />
              </Stack>

              {/* Trades */}
              <Stack
                direction={{ base: 'column', md: 'row' }}
                spacing={{ base: 0, md: 4 }}
                justifyItems={'center'}
                alignItems={'center'}
              >
                <Stack flexDirection={'column'} gap={4}>
                  <Button
                    colorScheme={'blue'}
                    isDisabled={trades.length >= 3}
                    onClick={() => {
                      setTrades([
                        ...trades,
                        {
                          make: undefined,
                          model: undefined,
                          year: undefined,
                          vin: undefined,
                        },
                      ]);
                    }}
                    w={'full'}
                  >
                    Add Trade
                  </Button>
                </Stack>
                {trades.map((trade, index) => {
                  return (
                    <Stack
                    outline={'1px solid'}
                      p={2}
                      justifyItems={'center'}
                      alignItems={'center'}
                      key={`trade-${index}`}
                      direction={{
                        base: trades.length > 1 ? 'column' : 'row',
                        md: trades.length > 1 ? 'column' : 'row',
                      }}
                      spacing={{ base: 0, md: 4 }}
                    >
                      <FormControl
                        isRequired
                        isInvalid={trade.isInvalid}
                        display={'flex'}
                        flexDirection={'column'}
                      >
                        <FormLabel>VIN</FormLabel>
                        <Input
                          placeholder="VIN"
                          value={trade.vin}
                          onChange={(e) => {
                            const newTrades = [...trades];
                            newTrades[index] = {
                              vin: e.target.value,
                            }
                            setTrades(newTrades);
                          }}
                        />
                        <ButtonGroup w={'full'} my={2}>
                          {/* Remove trade */}
                          <Button
                            w={'full'}
                            colorScheme={'red'}
                            variant={'ghost'}
                            onClick={() => {
                              const newTrades = [...trades];
                              newTrades.splice(index, 1);
                              setTrades(newTrades);
                            }}
                          >
                            Remove
                          </Button>
                        </ButtonGroup>
                        {trades[index].make && trades[index].model && (
                          <Text>
                            {formatInventory({
                              make: trades[index].make,
                              model: trades[index].model,
                              year: trades[index].year,
                            })}
                          </Text>
                        )}
                      </FormControl>
                      <CurrencyInput
                        formLabel="Trade Value"
                        isInvalid={
                          trades.reduce(
                            (acc, trade) => acc + (trade.value ?? 0),
                            0,
                          ) +
                            (+inventoryPrices.down || 0) >
                            Math.max(+changes.totalLoanAmount, +changes.totalOwed) ||
                          !trade.value
                        }
                        name={+(trade.value ?? 0)}
                        onChange={(_valueAsString, valueAsNumber) => {
                          const newTrades = [...trades];
                          newTrades[index].value = valueAsNumber;
                          setTrades(newTrades);
                        }}
                      />
                    </Stack>
                  );
                })}
              </Stack>

              <Stack direction={{ base: 'column', lg: 'row' }}>
                {changes.sale_type === 'credit' && (
                  <PersonSelector
                    // isInvalid={typeof changes.creditor === 'undefined'}
                    filter="creditor"
                    pid={cid}
                    onChange={(e: PersonCreditor) => {
                      console.log('e', e);
                      setChanges((changes) => ({
                        ...changes,
                        creditor: e.id,
                        filing_fees: e.filing_fees,
                        apr: e.apr,
                      }));
                    }}
                    label={'Creditor'}
                  />
                )}
                <PersonSelector
                  filter="salesman"
                  setPid={setSid}
                  pid={sid}
                  label={'Salesman'}
                />
                <FormControl isRequired>
                  <FormLabel>Date Purchased</FormLabel>
                  <Input
                    type={'date'}
                    value={changes.date}
                    onChange={(e) => {
                      setChanges({ ...changes, date: e.target.value });
                    }}
                  />
                </FormControl>

                {changes.sale_type == 'credit' && (
                  <Flex
                    // align rightmost
                    justifyContent={'flex-end'}
                    w={'100%'}
                  >
                    <FormControl w={'min-content'}>
                      <FormLabel w={'max-content'}>Filing Fees</FormLabel>
                      <Text>
                        {financeFormat({ num: +changes.filing_fees || 0 })}
                      </Text>
                    </FormControl>
                    <FormControl w={'min-content'}>
                      <FormLabel>APR</FormLabel>
                      <Text>{financeFormat({ num: +changes.apr || 0 })}</Text>
                    </FormControl>
                  </Flex>
                )}
              </Stack>
              <Divider />
            </Stack>
            <Stack
              display={forms.length > 0 ? 'block' : 'none'}
              direction={{ base: 'row', sm: 'column' }}
              spacing={{ base: 2, md: 4 }}
              w={'100%'}
              verticalAlign={'center'}
            >
              <Heading as="h3">{forms.length > 0 && 'Forms'}</Heading>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                spacing={{ base: 2, md: 4 }}
              >
                <Button
                  colorScheme="blue"
                  variant="solid"
                  h={'5ch'}
                  minW={'max-content'}
                  onClick={forms.length > 0 ? () => downloadZip(forms) : undefined}
                >
                  {<FaFileDownload />}{' '}
                  {
                    <span
                      style={{
                        display: 'inline-block',
                        width: '3ch',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        // backgroundColor: "white",
                        fontFamily: 'monospace',
                      }}
                    >
                      Zip
                    </span>
                  }
                </Button>
                <Select placeholder="Select a form">
                  {forms.map((form, index) => {
                    const title = Object.keys(form)[0];
                    const url = Object.values(form)[0];

                    if (!url) {
                      return <></>;
                    }

                    try {
                      return (
                        <option
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = url
                            a.target = '_blank'
                            a.download = `${title}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          key={index}
                        >
                          {title.split('-')[1].trim()}
                        </option>
                      );
                    } catch (error) {
                      console.error(error, { title, url, type: typeof url });
                      return <></>;
                    }
                  })}
                </Select>
              </Stack>
            </Stack>
            <Divider />
            <AboutDeal />
          </Stack>
        </Box>

        {/* {MemoizedSchedule} */}
        {/*{changes.sale_type === 'credit' && (*/}
        {/*  <RenderAmortizationSchedule*/}
        {/*    changes={changes}*/}
        {/*    calculatedFinance={calculatedFinance}*/}
        {/*    chartId="amortizationSchedule"*/}
        {/*  />*/}
        {/*)}*/}

        {/* <BarChart/> */}
        {/*
          {
      label: "Dataset 1",
      data: [300, 50, 100, 40, 120],
      backgroundColor: ["#080705", "#40434e", "#702632", "#912f40", "#b33a4f"],
    },
      */}
        <ButtonGroup>
          <Button type="submit" colorScheme={'blue'} w={'full'}>
            Save
          </Button>

        </ButtonGroup>
      </Stack>
    </StackWrap>
  );
}
