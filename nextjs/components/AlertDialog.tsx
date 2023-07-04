import {
  Button,
  ChakraProps,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  useDisclosure,
} from '@chakra-ui/react';

type basicHandler = (e: React.FormEvent) => void;

function ManualClose(props: {
  size?: ModalProps['size'];
  isOpen: boolean;
  onClose: () => void;
  handleConfirm: basicHandler;
  modalBody: JSX.Element;
  modalTitle?: string;
}) {
  const { isOpen, onClose, handleConfirm, modalBody, modalTitle, size } = props;

  return (
    <>
      <Modal
        size={size || 'lg'}
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{modalTitle ?? 'Confirm'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>{modalBody}</ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleConfirm}>
              Confirm
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ManualClose;
