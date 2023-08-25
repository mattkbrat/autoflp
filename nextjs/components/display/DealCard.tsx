import { SimpleDeal } from '@/types/prisma/deals';
import {
  Button,
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

export const DealCard = ({ deal }: { deal: SimpleDeal }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

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
      {deal.status && (
        <Button onClick={onOpen} variant={'outline'} colorScheme={'green'}>
          Take Payment
        </Button>
      )}
    </Stack>
  );
};
