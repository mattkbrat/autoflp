'use client';

import { InventoryWithDeals } from '@/types/prisma/inventory';
import { Code, Grid, GridItem, Heading, Stack } from '@chakra-ui/react';
import formatInventory from '@/utils/format/formatInventory';
import { useColors } from '@/hooks/useColors';
import { DealCard } from '@/components/display/DealCard';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';

// inventory: {id: string, vin: string, year: string, make: string, model: string | null, body: string | null, color: string | null, fuel: string | null, cwt: string | null, mileage: string | null, date_added: string | null, ...}
const InventoryCard = ({
  inventory,
}: {
  inventory: NonNullable<InventoryWithDeals>;
}) => {
  const formatted = formatInventory(inventory);

  const { bg, accent } = useColors();

  return (
    <Stack
      p={2}
      bg={bg}
      outline={accent}
      textAlign={'center'}
      alignItems={'center'}
      borderRadius={4}
    >
      <Heading>{formatted}</Heading>
      <Code>{inventory.vin.toUpperCase()}</Code>
      <Grid
        gap={4}
        templateColumns={{
          base: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
      >
        {inventory.deal.map((deal, n) => {
          return (
            <GridItem key={n}>
              <Stack p={4} outlineOffset={-4} borderRadius={2} outline={accent}>
                <Heading
                  as={'h3'}
                  size={'lg'}
                  textDecoration={'underline'}
                  textUnderlineOffset={2}
                >
                  {fullNameFromPerson(deal.Account.person)}
                </Heading>
                <DealCard
                  deal={{
                    ...deal,
                    lien: deal.lien || '-',
                    // formattedInventory: formatted,
                    status: deal.state === 1,
                  }}
                />
              </Stack>
            </GridItem>
          );
        })}
      </Grid>
    </Stack>
  );
};

export default InventoryCard;
