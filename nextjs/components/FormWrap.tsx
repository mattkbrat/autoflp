import { useEffect, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';

import StackWrap from './StackWrap';
import { anyObject } from '@/types/AnyObject';
import { useColors } from '@/hooks/useColors';
import globals from 'styles/globals.module.css';

import {
  Button,
  ButtonGroup,
  Divider,
  Heading,
  HStack,
  Spacer,
  Spinner,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';

function FormWrap<T extends anyObject | null>(props: {
  children: JSX.Element;
  title?: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onDelete?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onReset?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  deleteLabel?: string;
  formType?: 'new' | 'edit';
  changes: T;
  setChanges: React.Dispatch<React.SetStateAction<T | null>>;
  message?: string | object;
  defaultCollapsed?: boolean;
  customButton?: {
    label: string;
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
  };
}) {
  const {
    children: form,
    onSubmit,
    onDelete,
    onReset,
    deleteLabel = 'DELETE',
    formType = 'edit',
    title = 'Form',
    changes = {},
    setChanges,
    message,
    defaultCollapsed = false,
    customButton,
  } = props;

  const [loading, setLoading] = useState<boolean>(false);
  const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed);
  const toast = useToast();

  const colors = useColors();

  const bg = colors.accent;

  let formMessage = '';

  useEffect(() => {
    if (!formMessage) {
      return;
    }

    const messageSplit = formMessage.split(':');

    if ([null, 'null'].includes(messageSplit[0])) {
      return;
    }

    console.log(messageSplit);

    toast({
      title: messageSplit[0] || 'Message',
      description: messageSplit.length > 1 ? messageSplit[1] : formMessage,
      status: formMessage.toLowerCase().includes('error') ? 'error' : 'info',
      duration: 5000,
      isClosable: true,
    });
  }, [formMessage, toast]);

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    onReset && onReset(e);
    setChanges(null);
  };

  if (loading) {
    return <Spinner>Form {title} is loading...</Spinner>;
  }

  if (typeof message === 'object') {
    formMessage = JSON.stringify(message);
    if (formMessage.includes('constraint failed')) {
      const constraintsFailed =
        formMessage
          ?.split('constraint failed on the fields: (')[1]
          ?.split(' (')[0]
          ?.replaceAll(')"}', '')
          ?.replaceAll('`', '')
          ?.split(',') ?? [];
      formMessage =
        'ERROR: Existing record with matching values: ' +
        constraintsFailed.join(', ');
    }
  } else {
    formMessage = message ?? '';
  }

  return (
    <Stack
      alignSelf={{ base: 'center', md: 'flex-start' }}
      className={globals.no_print}
      // w={{ base: "full", md: "80%" }}
      p={4}
      verticalAlign="center"
      borderRadius="md"
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="md"
      w={`100%`}
      bg={bg}
      justifyItems="center"
      h={'full'}
      // p={4}
    >
      <form onSubmit={onSubmit}>
        <StackWrap
          padding={{
            base: 2,
            md: 4,
          }}
          spacing={4}
          heading={
            <HStack>
              <Heading as="h2" size="lg">
                {formType === 'new' ? 'New' : 'Edit'} {title}
                <Divider />
              </Heading>
              <Spacer />

              <Button
                onClick={() => {
                  setCollapsed(!collapsed);
                }}
              >
                {collapsed ? <FaPlus /> : <FaMinus />}
              </Button>
            </HStack>
          }
        >
          {collapsed ? null : (
            <>
              {form}
              <ButtonGroup spacing={5}>
                <Button
                  type="submit"
                  colorScheme={
                    formType === 'new' ? 'green' : formType === 'edit' ? 'blue' : ''
                  }
                  w={'100%'}
                  disabled={Object.keys(changes || {}).length === 0}
                  className={globals.no_print}
                >
                  {formType === 'new' ? 'CREATE' : 'UPDATE'}
                </Button>
                {typeof onDelete === 'function' && formType !== 'new' && (
                  <Button
                    type="button"
                    colorScheme="red"
                    onClick={onDelete}
                    w={'50%'}
                  >
                    {deleteLabel}
                  </Button>
                )}
                <Spacer />
                <Button
                  type="reset"
                  colorScheme="gray"
                  alignSelf={'flex-end'}
                  variant={'ghost'}
                  onClick={handleReset}
                  w={'50%'}
                >
                  RESET
                </Button>
                {customButton && (
                  <Button
                    type="button"
                    colorScheme="gray"
                    isDisabled={customButton.disabled}
                    alignSelf={'flex-end'}
                    variant={'ghost'}
                    onClick={customButton.onClick}
                    w={'50%'}
                  >
                    {customButton.label}
                  </Button>
                )}
              </ButtonGroup>
            </>
          )}
        </StackWrap>
      </form>
      {message && !collapsed && (
        <StackWrap
          heading={
            <>
              <Divider />
              <Heading as="h3" size="sm">
                Message
              </Heading>
            </>
          }
        >
          <Text
            color={
              (formMessage ?? '').toLowerCase().includes('error')
                ? 'red.500'
                : 'green.500'
            }
            fontSize="lg"
          >
            {formMessage}
          </Text>
        </StackWrap>
      )}
    </Stack>
  );
}

export default FormWrap;
