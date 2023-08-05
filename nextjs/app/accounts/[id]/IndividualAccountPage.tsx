'use client';

import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import formatInventory from '@/utils/format/formatInventory';
import { Heading, Stack, Text } from '@chakra-ui/react';
import formatCurrency from '@/utils/format/formatCurrency';
import { AccountsWithRelevant } from '@/types/prisma/accounts';

const IndividualAccountPage = ({
  account,
}: {
  account: AccountsWithRelevant[number];
}) => {
  if (!account) {
    return <Heading>Account not found</Heading>;
  }
  const fullName = fullNameFromPerson(account.person);
  const deals = account.deal_deal_accountToaccount
    .map((d) => {
      return {
        formattedInventory: formatInventory(d.inventory),
        lien: d.lien,
        cash: d.cash,
        status: d.state === 1,
      };
    })
    .sort((a, b) => {
      // Sort the deals by status, then by inventory
      if (a.status && !b.status) {
        return -1;
      } else if (!a.status && b.status) {
        return 1;
      } else {
        return a.formattedInventory.localeCompare(b.formattedInventory);
      }
    });

  return (
    <>
      <Heading>{fullName}</Heading>
      {deals.map((deal, n) => (
        <Stack color={deal.status ? undefined : 'gray.500'} key={'inventory-' + n}>
          <Heading as={'h3'} size={'lg'}>
            {deal.formattedInventory}
          </Heading>
          <Text>
            Lien: {formatCurrency(deal.lien)}
            <br />
            Cash: {formatCurrency(deal.cash)}
            <br />
            {deal.status ? 'Open' : 'Closed'}
          </Text>
        </Stack>
      ))}
      <pre>{JSON.stringify(account, null, 2)}</pre>
    </>
  );
};

export default IndividualAccountPage;
