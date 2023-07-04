// import { ReactEventHandler, useEffect, useState } from 'react';
// import { FaTrash } from 'react-icons/fa';
//
// import { useRouter } from 'next/router';
//
// import useSWR from 'swr';
//
// const fetcher = (url: string) => fetch(url).then((res) => res.json());
//
// import {
//   Box,
//   Button,
//   Code,
//   FormControl,
//   FormLabel,
//   Heading,
//   HStack,
//   Input,
//   Stack,
//   StackDivider,
//   Tab,
//   Table,
//   TabList,
//   TabPanel,
//   TabPanels,
//   Tabs,
//   Tbody,
//   Td,
//   Text,
//   Tfoot,
//   Th,
//   Thead,
//   Tr,
//   useDisclosure,
// } from '@chakra-ui/react';
// import { paymentsGetterType } from '@/utils/prisma/payments';
//
// import { payment } from "@prisma/client"
// import { Override } from "@/types/Oerride";
//
// type PaymentWithDate = Override<payment, { date: Date }>;
//
// // List of customers with account id, amount owed, and default payment amount
// export function PaymentForm({
//   deal_id,
//   modal_close,
// }: {
//   deal_id: string;
//   modal_close?: () => void;
// }): JSX.Element {
//   const router = useRouter();
//
//   const [selectedCustomer, setSelectedCustomer] =
//     useState<null | paymentsGetterType>(null);
//   const [message, setMessage] = useState<string | null>(null);
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const [changes, setChanges] = useState<Partial<PaymentWithDate>>({
//     payment: 0,
//     date: new Date(),
//   });
//
//   function getAmountOwed() {
//     const lien = parseFloat(selectedCustomer?.lien ?? '0');
//     let totalPaid = 0;
//     selectedCustomer?.payment?.forEach((payment) => {
//       totalPaid += parseFloat(payment?.amount ?? '0');
//     });
//     // console.log("totalPaid", totalPaid);
//     // const totalOwed = setSelectedCustomer.payment?.reduce((acc, payment) => acc - parseFloat(payment.amount), lien) ?? lien;
//     return lien - totalPaid;
//     // return totalOwed;
//   }
//
//   useEffect(() => {
//     if (changes?.payment > getAmountOwed()) {
//       setMessage('PaymentForm amount cannot be greater than amount owed');
//       setChanges({ ...changes, payment: getAmountOwed(), date: new Date() });
//     } else if (changes?.payment < 0) {
//       setMessage('\nUse the "View payment history" tab to delete payments.');
//       setChanges({ ...changes, payment: 0 });
//     }
//   }, [changes]);
//
//   const payments = useSWR(
//     deal_id && `/api/payments?deal_id=${deal_id}`,
//     fetcher,
//   ).data;
//
//   function CustomerFullName({
//     possessive = false,
//     textTransform = 'capitalize',
//   }: {
//     possessive?: boolean;
//     textTransform?: 'capitalize' | 'uppercase' | 'lowercase' | 'none';
//   }) {
//     const account = selectedCustomer?.account_accountTodeal?.person;
//     let name = `${account?.last_name}, ${account?.first_name}${
//       account?.middle_initial ? ` ${account.middle_initial.substring(0, 1)}` : ''
//     }`;
//     if (possessive) {
//       name = `${name}'s`;
//     }
//
//     return <Text textTransform={textTransform}>{name}</Text>;
//   }
//
//   function Inventory() {
//     const inventory = selectedCustomer?.inventory_dealToinventory;
//
//     return (
//       <Text textTransform={inventory?.make ? 'capitalize' : 'uppercase'}>
//         {inventory?.make} {inventory?.model} {inventory?.year.replace('.0', '')}
//       </Text>
//     );
//   }
//
//   function handleDeletePayment(payment_id: string) {
//     fetch(`/api/payments?payment_id=${payment_id}`, {
//       method: 'DELETE',
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         console.log('data', data);
//         if (data?.error) {
//           setMessage(data?.error);
//         } else {
//           setMessage('PaymentForm deleted');
//           setSelectedCustomer({
//             ...selectedCustomer,
//             payment: selectedCustomer?.payment?.filter(
//               (payment) => payment?.id !== payment_id,
//             ),
//           });
//         }
//       });
//   }
//
//   useEffect(() => {
//     if (payments) {
//       console.log('payments', payments.payments);
//       setSelectedCustomer(payments.payments);
//       setChanges({ ...changes, payment: payments.payments.pmt });
//     }
//   }, [payments]);
//
//   function handlePayment(deal_id: string, amount: string) {
//     if (!payments) {
//       return;
//     }
//     setChanges({ ...changes, payment: 0 });
//     fetch(`/api/payments`, {
//       method: 'POST',
//       body: JSON.stringify({
//         ...changes,
//         id: deal_id,
//       }),
//     })
//       .then((response) => response)
//       .then((response) => response.json()) // send response body to next then chain
//       .then((body) => {
//         if (body.payment) {
//           setMessage('PaymentForm successful');
//
//           const newCustomer = selectedCustomer;
//
//           if (!newCustomer) {
//             return;
//           }
//
//           newCustomer.payment = [
//             {
//               amount: amount,
//               id: body?.payment.id,
//               date:
//                 typeof changes.date === 'string'
//                   ? changes.date
//                   : changes.date instanceof Date
//                   ? changes.date.toISOString()
//                   : new Date().toISOString(),
//             },
//             ...(newCustomer?.payment ?? []),
//           ];
//
//           setSelectedCustomer(newCustomer);
//         } else {
//           if (+amount <= 0) {
//             setMessage('PaymentForm amount must be greater than 0.');
//           } else {
//             setMessage('PaymentForm failed, it has likely already been made.');
//           }
//         }
//       }) // you can use response body here
//       .finally(() => {
//         const win = window.open(
//           `/receipt?id=${deal_id}`,
//           '_blank',
//           'noopener,noreferrer',
//         );
//         if (win) win.opener = null;
//         onClose();
//       });
//   }
//
//   const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     onOpen();
//   };
//
//   const PaymentHistory = () => {
//     if (selectedCustomer?.payment.length === 0) {
//       return (
//         <Text>
//           No payments recorded.
//           <br />
//           Use the &quot;Record a payment&quot; tab to add a payment.
//         </Text>
//       );
//     }
//     return (
//       <Table variant="simple">
//         <Thead>
//           <Tr>
//             <Th>Delete</Th>
//             <Th>PaymentForm</Th>
//             <Th>Date</Th>
//           </Tr>
//         </Thead>
//         <Tbody>
//           {/* <pre>
//             <code>{JSON.stringify(selectedCustomer, null, 2)}</code>
//           </pre> */}
//           {/* Sort payments by date with newest first*/}
//           {selectedCustomer?.payment?.map((payment, n) => (
//             <Tr key={`payment-${n}`}>
//               <Td>
//                 <Button onClick={() => handleDeletePayment(payment?.id)}>
//                   <FaTrash />
//                 </Button>
//               </Td>
//               <Td>
//                 {Intl.NumberFormat('en-US', {
//                   style: 'currency',
//                   currency: 'USD',
//                 }).format(+payment.amount)}
//               </Td>
//               <Td>{new Date(Date.parse(payment.date)).toLocaleString()}</Td>
//             </Tr>
//           ))}
//         </Tbody>
//       </Table>
//     );
//   };
//
//   if (!payments) {
//     return <p>No payments</p>;
//   }
//
//   const PaymentForm = (
//     <Stack p={4} spacing={4} justifyItems={'center'} my={'auto'}>
//       <Text>
//         <CustomerFullName />
//         <br />
//         <Inventory />
//       </Text>
//       <FormControl isRequired id="payment_date">
//         <FormLabel>PaymentForm Date</FormLabel>
//         <Input
//           type="datetime-local"
//           value={new Date(
//             changes?.date?.toLocaleString().length > 2
//               ? (changes.date as string)
//               : new Date(),
//           )
//             ?.toISOString()
//             .slice(0, 16)}
//           name="date"
//           onChange={(e) =>
//             setChanges({ ...changes, date: new Date(e.target.value) })
//           }
//         />
//       </FormControl>
//       <FormControl isRequired>
//         <FormLabel>PaymentForm Amount</FormLabel>
//         <CurrencyInput
//           max={getAmountOwed()}
//           // formLabel="Amount"
//           name={+changes.payment ?? 0}
//           min={1}
//           step={5}
//           significantDigits={6}
//           onChange={(_valueAsString, valueAsNumber) =>
//             setChanges({ ...changes, payment: valueAsNumber })
//           }
//         />
//       </FormControl>
//       <Text>
//         Amount Owed:{' '}
//         {Intl.NumberFormat('en-US', {
//           style: 'currency',
//           currency: 'USD',
//         }).format(getAmountOwed())}
//         <br />
//         New amount owed:{' '}
//         {Intl.NumberFormat('en-US', {
//           style: 'currency',
//           currency: 'USD',
//         }).format(getAmountOwed() - +(changes.payment ?? 0))}
//       </Text>
//     </Stack>
//   );
//
//   return (
//     <Stack
//       my="auto"
//       spacing={4}
//       justifyItems={'center'}
//       alignContent={'center'}
//       verticalAlign="center"
//     >
//       {isOpen && (
//         <>
//           <AlertDialog
//             isOpen={isOpen}
//             onClose={onClose}
//             handleConfirm={() => {
//               const thisPayment: string =
//                 typeof changes.payment === 'string'
//                   ? changes.payment
//                   : changes.payment.toString();
//
//               if (Number.isNaN(+thisPayment) || +thisPayment <= 0) {
//                 setMessage('PaymentForm amount must be greater than 0.');
//               }
//               handlePayment(deal_id, thisPayment);
//             }}
//             modalBody={
//               <Stack>
//                 <Text fontSize={'1.5rem'}>
//                   Record this payment of{' '}
//                   <Code fontSize={'1.5rem'}>
//                     {Intl.NumberFormat('en-US', {
//                       style: 'currency',
//                       currency: 'USD',
//                     }).format(+changes?.payment)}
//                   </Code>
//                   ?
//                 </Text>
//                 <Table>
//                   <caption>PaymentForm Details</caption>
//                   <Thead>
//                     <Tr>
//                       <Th>PaymentForm</Th>
//                       <Td>
//                         {Intl.NumberFormat('en-US', {
//                           style: 'currency',
//                           currency: 'USD',
//                         }).format(+changes?.payment)}
//                       </Td>
//                     </Tr>
//                     <Tr>
//                       <Th>PaymentForm Date</Th>
//                       <Td colSpan={2}>
//                         {new Date(changes?.date as string).toLocaleString()}
//                       </Td>
//                     </Tr>
//                     <Tr>
//                       <Th>Account Name</Th>
//                       <Td colSpan={2}>
//                         <CustomerFullName />
//                       </Td>
//                     </Tr>
//                     <Tr>
//                       <Th>Inventory</Th>
//                       <Td colSpan={2}>
//                         <Inventory />
//                       </Td>
//                     </Tr>
//                   </Thead>
//                   <Tfoot>
//                     <Tr>
//                       <Th>New Amount Owed</Th>
//                       <Td>
//                         {Intl.NumberFormat('en-US', {
//                           style: 'currency',
//                           currency: 'USD',
//                         }).format(getAmountOwed() - +(changes?.payment ?? 0))}
//                       </Td>
//                     </Tr>
//                   </Tfoot>
//                 </Table>
//                 <Text
//                   fontSize={'1.5rem'}
//                   alignSelf={'center'}
//                   textTransform={'uppercase'}
//                 >
//                   new balance:{' '}
//                   {
//                     <Code color={'red.50'} bg={'red.500'} fontSize={'1.5rem'}>
//                       {Intl.NumberFormat('en-US', {
//                         style: 'currency',
//                         currency: 'USD',
//                       }).format(getAmountOwed() - +changes?.payment)}
//                     </Code>
//                   }
//                   .
//                 </Text>
//               </Stack>
//             }
//           />
//         </>
//       )}
//       <Tabs>
//         <TabList>
//           <Tab>Record a payment</Tab>
//           <Tab>View payment history</Tab>
//         </TabList>
//         <TabPanels>
//           <TabPanel>
//             <FormWrap
//               message={message ?? ''}
//               title="PaymentForm"
//               formType="new"
//               onSubmit={onSubmit}
//               form={PaymentForm}
//               changes={changes}
//               setChanges={setChanges}
//               customButton={{
//                 label: 'PRINT',
//                 disabled: selectedCustomer?.payment.length === 0,
//                 onClick: () => {
//                   // Spawn a new window with the receipt
//                   const win = window.open(
//                     `/receipt?id=${deal_id}`,
//                     '_blank',
//                     'noopener,noreferrer',
//                   );
//                   if (win) win.opener = null;
//                   // router.push(`/receipt?id=${deal_id}`);
//                 },
//               }}
//             />
//           </TabPanel>
//           <TabPanel>
//             <PaymentHistory />
//           </TabPanel>
//         </TabPanels>
//       </Tabs>
//     </Stack>
//   );
// }
