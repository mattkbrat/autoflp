'use client';

import * as React from 'react';
import { useEffect, useMemo } from 'react';

import { useCombobox } from 'downshift';
import { Searcher } from 'fast-fuzzy';

import {
  Box,
  Button,
  ButtonGroup,
  Input,
  InputGroup,
  InputRightElement,
  ListItem,
  Stack,
  Text,
  UnorderedList,
  useColorModeValue,
} from '@chakra-ui/react';

function DropdownCombobox({
  options,
  setValue,
  placeholder,
}: {
  options: string[];
  setValue: (arg1: string | number) => void;
  value?: string | number;
  placeholder?: string;
}) {
  const [inputItems, setInputItems] = React.useState(options);

  const searcher = useMemo(() => new Searcher(options || []), [options]);

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
    selectItem,
  } = useCombobox({
    items: inputItems,
    onInputValueChange: ({ inputValue }) => {
      if (!inputValue) {
        setInputItems(options);
        return;
      }

      const newFuzzy = searcher.search(inputValue || '');
      if (newFuzzy.length <= 3) {
        setInputItems(options);
        return;
      }
      setInputItems(newFuzzy);
    },
  });

  useEffect(() => {
    if (!selectedItem) {
      return;
    }
    setValue(selectedItem);
  }, [selectedItem]);

  useEffect(() => {
    //   Register an event listener for the enter key to select the first highlighted item
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        if (highlightedIndex !== -1) {
          selectItem(inputItems[highlightedIndex]);
        } else {
          selectItem(inputItems[0]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, highlightedIndex, inputItems, selectItem]);

  const listBg = useColorModeValue('white', 'gray.800');

  return (
    <Stack maxW={'full'} spacing={2} border={'1px solid'} p={2}>
      <Text
        as={'label'}
        fontSize={'md'}
        fontWeight={'bolder'}
        color={selectedItem ? selectedItem : 'black'}
        {...getLabelProps()}
      >
        {placeholder}
      </Text>
      <Box display={'flex'} position={'relative'} w={'full'}>
        <InputGroup position={'relative'} w='full'>
          <Input p={2} 
          placeholder={'SEARCH'}
          {...getInputProps()} w='full' data-testid="combobox-input" />
          <InputRightElement w={'max-content'}>
            <ButtonGroup>
              <Button
                _hover={{
                  bg: 'transparent',
                }}
                colorScheme={'gray'}
                variant={'ghost'}
                size={'sm'}
                aria-label="toggle menu"
                data-testid="combobox-toggle-button"
                {...getToggleButtonProps()}
              >
                {isOpen ? <>&#8593;</> : <>&#8595;</>}
              </Button>
            </ButtonGroup>
          </InputRightElement>
        </InputGroup>
        <Button
          alignSelf={'center'}
          colorScheme={'red'}
          variant={'ghost'}
          size={'sm'}
          data-testid="clear-button"
          onClick={() => {
            selectItem(null);
            setValue('');
          }}
        >
          &#10007;
        </Button>
      </Box>
      <Box h={'full'} position={'relative'}>
        <UnorderedList
          {...getMenuProps()}
          // style={{
          //   listStyle: 'none',
          //   width: '100%',
          //   padding: '0',
          //   margin: '4px 0 0 0',
          // }}
          // listStyle={'none'}
          bg={listBg}
          width={'fit-content'}
          h={'30vh'}
          padding={0}
          margin={0}
          zIndex={100}
          boxShadow={'md'}
          top={0}
          left={0}
          overflow={'auto'}
          position={'absolute'}
        >
          {isOpen &&
            inputItems.map((item, index) => (
              <ListItem
                // style={{
                //   padding: '4px',
                //   backgroundColor: highlightedIndex === index ? '#bde4ff' : null,
                // }}
                padding={4}
                pr={20}
                backgroundColor={highlightedIndex === index ? '#bde4ff' : undefined}
                key={`${item}${index}`}
                {...getItemProps({
                  item,
                  index,
                })}
              >
                {item}
              </ListItem>
            ))}
        </UnorderedList>
      </Box>
    </Stack>
  );
}

export default DropdownCombobox;
