import { useEffect, useMemo, useState } from 'react';
import { FaTrash } from 'react-icons/fa';

import useSWR from 'swr';

import AlertDialog from '@/components/AlertDialog';

import {
  Button,
  Code,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Tab,
  Table,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import {
  AccountsWithRelevantWithPayments,
  DealPayment,
  PaymentWithDate,
} from '@/types/prisma/payments';
import { AccountWithRelevantDeal } from '@/types/prisma/accounts';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import formatInventory from '@/utils/format/formatInventory';
import CurrencyInput from '@/components/Inputs/CurrencyInput';
import FormWrap from '@/components/FormWrap';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const deletePayment = async (id: string) => {
  return fetch(`/api/payments/${id}`, {
    method: 'DELETE',
  }).then((res) => res.json());
};

const recordPayment = async ({
  amount,
  deal,
  date,
}: {
  amount: number;
  deal: string;
  date: Date;
}) => {
  const body: PaymentWithDate = {
    amount: amount.toFixed(2),
    payment: amount,
    date: date,
    deal: deal,
    id: '',
  };
  return fetch(`/api/payments/${deal}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response)
    .then((response) => response.json()); // send response body to next then chain
};

const PaymentForm = ({
  dealId,
  modal_close,
}: {
  dealId: string;
  modal_close?: () => void;
}) => {
  const toast = useToast();

  const [selectedCustomer, setSelectedCustomer] =
    useState<null | AccountsWithRelevantWithPayments>(null);

  const [message, setMessage] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [changes, setChanges] = useState<Partial<PaymentWithDate> | null>({
    payment: 0,
    date: new Date(),
  });

  useEffect(() => {
    fetch(`/api/deal/${dealId}`).then(async (res) => {
      const data: AccountsWithRelevantWithPayments = await res.json();
      console.log(data);
      setSelectedCustomer(data);
      setChanges({
        ...changes,
        payment: +(data.deal_deal_accountToaccount?.[0]?.pmt || 0),
      });
    });
  }, [dealId]);

  const thisDeal = useMemo(() => {
    if (!selectedCustomer) return null;
    return (selectedCustomer.deal_deal_accountToaccount.find(
      (d) => d.id === dealId,
    ) || null) as AccountWithRelevantDeal | null;
  }, [selectedCustomer, dealId]);

  const thisInventory = useMemo(() => {
    if (!selectedCustomer) return '';
    return formatInventory(thisDeal?.inventory);
  }, [selectedCustomer, thisDeal]);

  const thisPerson = useMemo(() => {
    if (!selectedCustomer) return '';
    return fullNameFromPerson(selectedCustomer.person);
  }, [selectedCustomer]);

  const amountOwed = useMemo(() => {
    const lien = parseFloat(thisDeal?.lien || '0');
    let totalPaid = 0;
    selectedCustomer?.payment?.forEach((payment) => {
      totalPaid += payment?.amount ? parseFloat(payment?.amount) : 0;
    });
    return lien - totalPaid;
  }, [selectedCustomer, thisDeal]);

  // useEffect(() => {
  //
  //   const originalChanges = JSON.stringify(changes);
  //
  //   if (!changes?.payment || changes?.payment > amountOwed) {
  //     setMessage('PaymentForm amount cannot be greater than amount owed');
  //     setChanges({ ...changes, payment: amountOwed, date: new Date() });
  //   } else if (changes?.payment < 0) {
  //     setMessage('\nUse the "View payment history" tab to delete payments.');
  //     setChanges({ ...changes, payment: 0 });
  //   }
  // }, [changes]);

  // We want the list of the deal's payments to auto refresh in the case that the page is left open.
  const payments = useSWR(dealId && `/api/payments/${dealId}`, fetcher).data;

  const handleDeletePayment = (id: string) => {
    if (!selectedCustomer) {
      toast({
        title: 'Error',
        description: 'No customer selected',
      });
      return;
    }
    return deletePayment(id).then((data) => {
      if (data?.error) {
      } else {
        setMessage('PaymentForm deleted');
        setSelectedCustomer({
          ...selectedCustomer,
          payment: selectedCustomer?.payment?.filter(
            (payment) => payment?.id !== id,
          ),
        });
      }
    });
  };

  // useEffect(() => {
  //   if (!payments) {
  //     return;
  //   }
  //   setSelectedCustomer(payments.payments);
  //   setChanges({ ...(changes || {}), payment: payments.payments.pmt });
  // }, [payments]);

  function handlePayment(deal_id: string, amount: string) {
    if (!payments || !thisDeal || !changes) {
      return;
    }
    setChanges({ ...(changes || { date: new Date() }), payment: 0 });
    recordPayment({
      amount: Number(amount),
      deal: deal_id,
      date: changes?.date || new Date(),
    })
      .then((body) => {
        if (body.amount) {
          setMessage('Payment successful');

          const newCustomer = selectedCustomer;

          if (!newCustomer) {
            return;
          }

          newCustomer.payment = [
            {
              amount: amount,
              id: body?.id,
              date: new Date(),
              deal: deal_id,
              payment: +amount,
            },
            ...(newCustomer?.payment ?? []),
          ];

          setSelectedCustomer(newCustomer);
        } else {
          if (+amount <= 0) {
            setMessage('Payment amount must be greater than 0.');
          } else {
            setMessage('Payment not recorded. It has likely already been recorded.');
          }
        }
      }) // you can use response body here
      .finally(() => {
        const win = window.open(
          `/receipt/${deal_id}`,
          '_blank',
          'noopener,noreferrer',
        );
        if (win) win.opener = null;
        onClose();
      });
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onOpen();
  };

  const PaymentHistory = () => {
    if (selectedCustomer?.payment.length === 0) {
      return (
        <Text>
          No payments recorded.
          <br />
          Use the &quot;Record a payment&quot; tab to add a payment.
        </Text>
      );
    }
    return (
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Delete</Th>
            <Th>Pmt</Th>
            <Th>Date</Th>
          </Tr>
        </Thead>
        <Tbody>
          {/* <pre>
            <code>{JSON.stringify(selectedCustomer, null, 2)}</code>
          </pre> */}
          {/* Sort payments by date with newest first*/}
          {selectedCustomer?.payment?.map((payment, n) => (
            <Tr key={`payment-${n}`}>
              <Td>
                <Button onClick={() => handleDeletePayment(payment?.id)}>
                  <FaTrash />
                </Button>
              </Td>
              <Td>
                {Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(+payment.amount)}
              </Td>
              <Td>{payment.date.toLocaleString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    );
  };

  if (!payments) {
    return <p>No payments</p>;
  }

  if (!selectedCustomer) {
    return (
      <p>No customer selected. Please select a customer from the list on the left</p>
    );
  }

  return (
    <Stack
      my="auto"
      spacing={4}
      justifyItems={'center'}
      alignContent={'center'}
      verticalAlign="center"
    >
      {isOpen && (
        <>
          <AlertDialog
            isOpen={isOpen}
            onClose={onClose}
            handleConfirm={() => {
              if (!changes?.payment) {
                setMessage('Payment amount must be greater than 0.');
                return;
              }
              const thisPayment: string = changes.payment.toFixed(2);

              if (Number.isNaN(+thisPayment) || +thisPayment <= 0) {
                setMessage('Payment amount must be greater than 0.');
              }
              handlePayment(dealId, thisPayment);
            }}
          >
            <Stack>
              <Text fontSize={'1.5rem'}>
                Record this payment of{' '}
                <Code fontSize={'1.5rem'}>
                  {Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(+(changes?.payment || 0))}
                </Code>
                ?
              </Text>
              <Table>
                <caption>Details</caption>
                <Thead>
                  <Tr>
                    <Th>Payment</Th>
                    <Td>
                      {Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(+(changes?.payment || 0))}
                    </Td>
                  </Tr>
                  <Tr>
                    <Th>Date</Th>
                    <Td colSpan={2}>
                      {(changes?.date || new Date()).toLocaleString()}
                    </Td>
                  </Tr>
                  <Tr>
                    <Th>Account Name</Th>
                    <Td colSpan={2}>{thisPerson}</Td>
                  </Tr>
                  <Tr>
                    <Th>Inventory</Th>
                    <Td colSpan={2}>{}</Td>
                  </Tr>
                </Thead>
                <Tfoot>
                  <Tr>
                    <Th>New Amount Owed</Th>
                    <Td>
                      {Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(amountOwed - +(changes?.payment || 0))}
                    </Td>
                  </Tr>
                </Tfoot>
              </Table>
              <Text
                fontSize={'1.5rem'}
                alignSelf={'center'}
                textTransform={'uppercase'}
              >
                new balance:{' '}
                {
                  <Code color={'red.50'} bg={'red.500'} fontSize={'1.5rem'}>
                    {Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(amountOwed - +(changes?.payment || 0))}
                  </Code>
                }
                .
              </Text>
            </Stack>
          </AlertDialog>
        </>
      )}
      <Tabs>
        <TabList>
          <Tab>Record a payment</Tab>
          <Tab>View payment history</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <FormWrap
              message={message ?? ''}
              title="Payment"
              formType="new"
              onSubmit={onSubmit}
              changes={changes || { payment: 0, date: new Date() }}
              setChanges={setChanges}
              customButton={{
                label: 'PRINT',
                disabled: selectedCustomer?.payment.length === 0,
                onClick: () => {
                  // Spawn a new window with the receipt
                  const win = window.open(
                    `/receipt?id=${dealId}`,
                    '_blank',
                    'noopener,noreferrer',
                  );
                  if (win) win.opener = null;
                  // router.push(`/receipt?id=${deal_id}`);
                },
              }}
            >
              <Stack p={4} spacing={4} justifyItems={'center'} my={'auto'}>
                <Text>
                  {thisPerson}
                  <br />
                  {thisInventory}
                </Text>
                <FormControl isRequired id="payment_date">
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="datetime-local"
                    value={
                      changes?.date?.toISOString().slice(0, 16) ||
                      new Date().toISOString().slice(0, 16)
                    }
                    name="date"
                    onChange={(e) =>
                      setChanges({
                        ...(changes || { payment: 0 }),
                        date: new Date(e.target.value),
                      })
                    }
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Amount</FormLabel>
                  <CurrencyInput
                    max={amountOwed}
                    // formLabel="Amount"
                    name={+(changes?.payment || 0)}
                    min={1}
                    step={5}
                    significantDigits={6}
                    onChange={(_valueAsString, valueAsNumber) =>
                      setChanges({
                        ...(changes || { date: new Date() }),
                        payment: valueAsNumber,
                      })
                    }
                  />
                </FormControl>
                <Text>
                  Amount Owed:{' '}
                  {Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(amountOwed)}
                  <br />
                  New amount owed:{' '}
                  {Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(amountOwed - +(changes?.payment || 0))}
                </Text>
              </Stack>
            </FormWrap>
          </TabPanel>
          <TabPanel>
            <PaymentHistory />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
};

export default PaymentForm;
