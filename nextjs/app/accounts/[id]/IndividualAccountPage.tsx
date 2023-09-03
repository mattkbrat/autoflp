'use client';

import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Divider,
  Grid,
  GridItem,
  Heading,
  Text,
} from '@chakra-ui/react';
import {
  AccountWithRelevantDealOmit,
  AccountWithRelevantNotNull,
} from '@/types/prisma/accounts';
import { SimpleDeal } from '@/types/prisma/deals';
import { addressFromPerson } from '@/utils/format/addressFromPerson';
import { DealCard } from '@/components/display/DealCard';
import PersonForm from '@/components/forms/PersonForm';
import AccountForm from '@/components/forms/AccountForm';
import React from 'react';

const IndividualAccountPage = ({
  account,
  deals,
}: {
  account: AccountWithRelevantDealOmit;
  deals: SimpleDeal[];
}) => {
  if (!account) {
    return <Heading>Account not found</Heading>;
  }
  const fullName = fullNameFromPerson(account.person);
  const address = addressFromPerson({ person: account.person });

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
      <Divider />
      <Breadcrumb fontSize={'lg'}>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/accounts`}>Accounts</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>
            {fullNameFromPerson(account.person).toUpperCase()}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <PersonForm editing={account.person} />
      {account.person && <AccountForm editing={account} />}
    </>
  );
};

export default IndividualAccountPage;
