import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
} from '@chakra-ui/react';

type basicHandler = (e: React.FormEvent) => void;

function AlertDialog(props: {
  size?: ModalProps['size'];
  isOpen: boolean;
  onClose: () => void;
  handleConfirm: basicHandler;
  modalTitle?: string;
  children?: React.ReactNode;
}) {
  const { isOpen, onClose, handleConfirm, children, modalTitle, size } = props;

  return (
    <>
      <Modal
        size={size || 'lg'}
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent mt={'auto'} mb={'auto'}>
          <ModalHeader>{modalTitle ?? 'Confirm'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>{children}</ModalBody>

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

export default AlertDialog;
