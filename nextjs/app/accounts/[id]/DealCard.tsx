import { SimpleDeal } from '@/types/prisma/deals';
import { Button, Heading, Stack, Text } from '@chakra-ui/react';
import formatCurrency from '@/utils/format/formatCurrency';

export const DealCard = ({ deal }: { deal: SimpleDeal }) => {
  return (
    <Stack
      background={'blackAlpha.50'}
      p={2}
      color={deal.status ? undefined : 'gray.500'}
      textAlign={'center'}
    >
      <Heading as={'h3'} size={'lg'}>
        {deal.formattedInventory}
      </Heading>
      <Text>
        Lien: {formatCurrency(deal.lien)}
        <br />
        Cash: {formatCurrency(deal.cash)}
        <br />
        Creditor: {deal.creditors?.business_name}
        <br />
        {deal.status ? 'Open' : 'Closed'}
      </Text>
      {deal.status && (
        <Button variant={'outline'} colorScheme={'green'}>
          Take Payment
        </Button>
      )}
    </Stack>
  );
};
