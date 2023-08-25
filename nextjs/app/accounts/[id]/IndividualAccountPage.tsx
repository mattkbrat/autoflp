'use client';

import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import { Grid, GridItem, Heading, Text } from '@chakra-ui/react';
import { AccountWithRelevantNotNull } from '@/types/prisma/accounts';
import { SimpleDeal } from '@/types/prisma/deals';
import { addressFromPerson } from '@/utils/format/addressFromPerson';
import { DealCard } from '@/components/display/DealCard';

const IndividualAccountPage = ({
  account,
  deals,
}: {
  account: Omit<AccountWithRelevantNotNull, 'deal_deal_accountToaccount'>;
  deals: SimpleDeal[];
}) => {
  if (!account) {
    return <Heading>Account not found</Heading>;
  }
  const fullName = fullNameFromPerson(account.person);
  const address = addressFromPerson(account.person);

  return (
    <>
      <Heading as={'h1'}>{fullName}</Heading>
      <Text>
        {address.full}
        <br />
        {account.person.phone_primary}
      </Text>
      <Heading as={'h2'} size={'xl'}>
        Deals
      </Heading>

      <Grid
        gap={4}
        templateColumns={{
          base: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        }}
      >
        {deals.map((deal, n) => {
          return (
            <GridItem key={n}>
              <DealCard deal={deal} />
            </GridItem>
          );
        })}
      </Grid>
    </>
  );
};

export default IndividualAccountPage;
