'use client';

import { InventoryWithDeals } from '@/types/prisma/inventory';
import { Code, Grid, GridItem, Heading, Spinner, Stack } from '@chakra-ui/react';
import formatInventory from '@/utils/format/formatInventory';
import { useColors } from '@/hooks/useColors';
import { DealCard } from '@/components/display/DealCard';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import { useEffect, useMemo, useState } from 'react';

const InventoryCard = ({
  inventoryID,
  inventory: defaultInventory,
  withAccounts = true,
}: {
  inventoryID?: string | null;
  inventory?: InventoryWithDeals;
  withAccounts?: boolean;
}) => {
  const [inventory, setInventory] = useState<InventoryWithDeals>(defaultInventory || null);

  useEffect(() => {
    inventoryID &&
    setInventory(null)
  }
  , [inventoryID]);

  useEffect(() => {
    if (!inventory && inventoryID) {
      fetch(`/api/inventory/${inventoryID}/withDeals`)
        .then((res) => res.json())
        .then((data) => {
          setInventory(data);
        }
      );
    }
  }, [inventory, inventoryID]);

  const formatted = useMemo(() => {
    if (inventory) {
      return formatInventory(inventory);
    }
    return '';
  }, [inventory]);

  const { bg, accent } = useColors();

  if (!inventory){
    return (
        inventoryID ? <Spinner /> : <div>No inventory selected</div> 
    )
  }
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
        {withAccounts && inventory.deal.map((deal, n) => {
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
