import { SimpleDeal } from '@/types/prisma/deals';
import {
  Button,
  ButtonGroup,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import formatCurrency from '@/utils/format/formatCurrency';
import PaymentForm from '@/components/forms/PaymentForm';
import { useRouter } from 'next/navigation';

export const DealCard = ({ deal }: { deal: SimpleDeal }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const closeDeal = async () => {
    const ok = confirm('Are you sure you want to close this deal?');
    if (!ok) return;
    const res = await fetch(`/api/deal/${deal.id}`, {
      method: 'PUT',
      body: JSON.stringify({ state: 0 }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      router.refresh();
    }
  };

  const openDeal = async () => {
    const ok = confirm('Are you sure you want to re-open this deal?');
    if (!ok) return;
    const res = await fetch(`/api/deal/${deal.id}`, {
      method: 'PUT',
      body: JSON.stringify({ state: 1 }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      router.refresh();
    }
  };
  return (
    <Stack
      background={'blackAlpha.50'}
      p={2}
      color={deal.status ? undefined : 'gray.500'}
      textAlign={'center'}
    >
      <Modal isOpen={isOpen} onClose={onClose} size={'xl'}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <PaymentForm dealId={deal.id} />
          </ModalBody>
        </ModalContent>
      </Modal>

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
      {deal.status ? (
        <ButtonGroup>
          <Button w={'full'} onClick={onOpen} variant={'outline'} colorScheme={'green'}>
            Take Payment
          </Button>
          <Button w={'33%'} onClick={closeDeal} variant={'outline'} colorScheme={'red'}>
            Close Deal
          </Button>
        </ButtonGroup>
      ) : (
        <Button onClick={openDeal} variant={'outline'} colorScheme={'green'}>
          Re-Open Deal
        </Button>
      )}
    </Stack>
  );
};
