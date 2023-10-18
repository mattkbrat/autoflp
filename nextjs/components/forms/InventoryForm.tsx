'use client';

import {
  Dispatch,
  FormEvent,
  memo,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { usePathname, useRouter } from 'next/navigation';

import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  Flex,
  FormControl,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  ListItem,
  NumberInput,
  NumberInputField,
  Select,
  Spacer,
  Spinner,
  Stack,
  Tab,
  Table,
  TableContainer,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Th,
  Tooltip,
  Tr,
  UnorderedList,
  useToast,
} from '@chakra-ui/react';
import { type InventoryWithDeals, type Inventory } from '@/types/prisma/inventory';
import { BiRepeat, BiSearch } from 'react-icons/bi';
import { TextInput } from '@/components/Inputs/TextInput';
import CurrencyInput from '@/components/Inputs/CurrencyInput';

const priceTypes = ['cash', 'credit', 'down'] as const;

const debug = false;

const InventoryForm = (props: {
  setIid?: Dispatch<SetStateAction<InventoryWithDeals['id']>>;
  includePrices?: boolean;
  setInventoryPrices?: Dispatch<SetStateAction<Partial<InventoryWithDeals>>>;
  selectedId?: InventoryWithDeals['id'];
  initialQuery?: string;
  id?: string;
  withSearch?: boolean;
}) => {
  const router = useRouter();
  const toast = useToast();
  const pathname = usePathname();

  const [changes, setChanges] = useState<Partial<InventoryWithDeals>>({});
  const [vinLookup, setVinLookup] = useState<string>('');
  const [searchingVin, setSearchingVin] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [inventoryLookupType, setInventoryLookupType] = useState<
    'active' | 'inactive' | 'all' | undefined
  >('active');
  const [fetchedInventory, setFetchedInventory] = useState<Inventory[]>([]);

  useEffect(() => {
    if (!message) return;
    toast({
      title: message,
      status: message.toLowerCase().includes('success') ? 'success' : 'error',
      duration: 3000,
      isClosable: true,
    });
    setMessage(null);
  }, [message, toast]);

  const [loading, setLoading] = useState<boolean>(false);

  const {
    setIid,
    includePrices = true,
    setInventoryPrices,
    id = '',
    withSearch = true,
  } = props;

  const [inventoryId, setInventoryId] = useState<Inventory['id'] | null>(
    (id as string) ?? props.selectedId ?? null,
  );

  useEffect(() => {
    setFetchedInventory([]);

    const url = `/api/inventory${
      inventoryLookupType === 'all'
        ? ''
        : `?state=${inventoryLookupType === 'active' ? 1 : 0}`
    }`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setFetchedInventory(data);
      });
  }, [inventoryLookupType]);

  useEffect(() => {
    if (id !== inventoryId) {
      setInventoryId(id as string);
    }
  }, [id, setInventoryId, inventoryId]);

  useEffect(() => {
    if (props.initialQuery === 'active') {
      setInventoryLookupType('active');
    } else if (props.initialQuery === 'inactive') {
      setInventoryLookupType('inactive');
    } else if (props.initialQuery === 'all') {
      setInventoryLookupType('all');
    }
  }, [props.initialQuery]);

  useEffect(() => {
    if (inventoryId) {
      setLoading(true);
      fetch(`/api/inventory/${inventoryId}`)
        .then((res) => res.json())
        .then((data) => {
          setChanges({});
          data?.id === inventoryId && setChanges(data);
          if (!setInventoryPrices) {
            return;
          }
          setInventoryPrices((prev) => {
            return {
              ...prev,
              cash: data.inventory.cash,
              credit: data.inventory.credit,
              down: data.inventory.down,
            };
          });
        });
    }
    setLoading(false);
  }, [inventoryId, setInventoryPrices]);

  useEffect(() => {
    if (setIid && typeof changes?.vin === 'string') {
      setIid(changes?.vin);
    }

    if (typeof changes == 'undefined') {
      return;
    }

    priceTypes.map((priceType) => {
      if (setInventoryPrices && typeof changes[priceType] === 'string') {
        setInventoryPrices((prev) => {
          return {
            ...prev,
            [priceType]: changes[priceType],
          };
        });
      }
    });
  }, [changes, setIid, setInventoryPrices]);

  // Search vin when vin is 17 characters long
  useEffect(() => {

    if (!changes?.vin) {
      return;
    }

    changes.vin?.length === 17 && searchVin();
  }, [changes?.vin]);

  const filteredInventory = useMemo(() => {
    if (filter === '') {
      if (Array.isArray(fetchedInventory)) {
        return fetchedInventory;
      } else {
        return [];
      }
    } else {
      return fetchedInventory.filter((inventory) => {
        const filters = filter.split(' ');

        return filters.some((filter) => {
          return (
            inventory.vin.toLowerCase().includes(filter.toLowerCase()) ||
            inventory.make.toLowerCase().includes(filter.toLowerCase()) ||
            inventory.model?.toLowerCase().includes(filter.toLowerCase()) ||
            inventory.year.toString().toLowerCase().includes(filter.toLowerCase()) ||
            inventory.color?.toLowerCase().includes(filter.toLowerCase())
          );
        });
      });
    }
  }, [fetchedInventory, filter]);

  async function searchVin() {
    const vin = changes.vin;
    if (!vin) {
      setMessage('Please enter a VIN');
      return;
    }

    setSearchingVin(true);

    fetch(`/api/inventory/${vin}/vin`)
      .then((res) => res.json())
      .then((data) => {
        setVinLookup(data.all);
        setChanges({ ...changes, ...data.vin });
      })
      .then(() => {
        setMessage(
          'VIN found! Check the lookup tab for all fetched information. (success)',
        );
      })
      .catch(() => {
        setMessage('VIN not found!');
      })
      .finally(() => {
        setSearchingVin(false);
      });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement | HTMLDivElement>) {
    e?.preventDefault();
    const updates = {
      ...changes,
      id: changes.id,
    };

    const url = `/api/inventory${changes?.id ? `/${changes?.id}` : ''}`;

    fetch(url, {
      method: changes.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).then(async (res) => {
      const json = res.ok ? null : await res.json();
      res.ok ? setMessage('Success!') : setMessage('Error! ' + json.message);
    });
  }

  function handleReset() {
    setChanges({});
    router.refresh();
  }

  async function handleClose(e: FormEvent<HTMLButtonElement>) {
    e.preventDefault();
    fetch('/api/inventory/' + id, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => {
        res.ok ? setMessage('Success!') : setMessage('Error!');
        res.ok && router.refresh();
        // if (redirect) {
        //   setInventoryId(null);
        //   setSingleInventory(null);
        //   router.refresh();
        // } else {
        //   setInventoryId(null);
        //   const thisVehicle = fetchedInventory.find((inv) => inv.id === inventoryId);
        //   if (thisVehicle) {
        //     setFetchedInventory((prev) => {
        //       return prev.filter((inv) => inv.id !== inventoryId);
        //     });
        //   }
      })
      .then(handleReset);
  }

  function handleDelete() {
    const vin = changes.vin;

    const ok = confirm(
      `Are you sure you want to delete ${vin}? This will also delete all related deals.`,
    );

    if (!ok) {
      return;
    }

    fetch('/api/inventory', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vin }),
    })
      .then((res) => {
        res.ok ? setMessage('Success!') : setMessage('Error!');
        setFetchedInventory((prev) => {
          return prev.filter((inv) => inv.vin !== vin);
        });
      })
      .then(handleReset);
  }

  const mileageExempt =
    +(changes?.year ?? 0) + (10 + (new Date().getFullYear() - 2021)) <
    new Date().getFullYear();

  if (loading) {
    return <Spinner />;
  }

  return (
    <Tabs
      // width={"100vw"}
      // display={"flex"}
      // flexDirection={"column"}
      justifyContent={'center'}
      alignItems={'center'}
    >
      <TabList>
        <Tab>Inventory</Tab>
        {vinLookup && <Tab>NHTSA VIN Lookup</Tab>}
      </TabList>
      <TabPanels>
        <TabPanel>
          {/*<FormWrap*/}
          {/*  title={'inventory'}*/}
          {/*  form={InventoryForm}*/}
          {/*  onSubmit={handleSubmit}*/}
          {/*  onReset={() => {*/}
          {/*    handleReset();*/}
          {/*  }}*/}
          {/*  message={message || ''}*/}
          {/*  changes={changes}*/}
          {/*  setChanges={setChanges}*/}
          {/*  onDelete={handleDelete}*/}
          {/*  customButton={*/}
          {/*    inventoryLookupType !== 'active' && singleInventory?.state === 0*/}
          {/*      ? {*/}
          {/*          label: 'Open',*/}
          {/*          onClick: () => {*/}
          {/*            const newInventory = singleInventory;*/}
          {/*            newInventory.state = 1;*/}
          {/*            setSingleInventory(newInventory);*/}
          {/*            handleSubmit(undefined);*/}
          {/*          },*/}
          {/*        }*/}
          {/*      : undefined*/}
          {/*  }*/}
          {/*  formType={singleInventory?.id ? 'edit' : 'new'}*/}
          {/*/>*/}
          <Stack as={'form'} onSubmit={handleSubmit}>
            <Stack spacing={4} direction="column">
              {debug && (
                <pre>
                  {JSON.stringify({ inventoryId, mileageExempt, changes }, null, 2)}
                </pre>
              )}
              {withSearch && (
                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  spacing={{ base: 4, md: 10 }}
                  justifyItems={{ base: 'center', md: 'flex-start' }}
                >
                  <Select
                    w={'100%'}
                    placeholder={
                      fetchedInventory && fetchedInventory.length > 0
                        ? `Select from ${filter && 'filtered'} ${
                            inventoryLookupType ?? 'all'
                          } inventory, with ${filteredInventory.length} results`
                        : 'No inventory found'
                    }
                    value={inventoryId ?? ''}
                    onChange={(e) => {

                      let currentParams = document.location.href.split("?").slice(-1)[0];
                      if (currentParams.includes('http')) currentParams = ""

                      const params = new URLSearchParams(currentParams)
                      params.set('inventory', e.target.value)
                      const newRoute = `${pathname}?${params.toString()}`

                      console.log(currentParams, params.toString())


                      router.push(newRoute);
                    }}
                  >
                    {filteredInventory?.map((inventory, n) => {
                      return (
                        <option value={inventory.id} key={`inventory-select-${n}`}>
                          {`${inventory.make}\t`} {inventory.model} {inventory.year}{' '}
                          {inventory.vin?.substring(inventory.vin.length - 6)}
                        </option>
                      );
                    })}
                  </Select>
                  <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                    <InputGroup w="100%">
                      <Input
                        placeholder="Search by attribute"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      />
                      <InputRightElement>
                        <Icon as={BiSearch} />
                      </InputRightElement>
                    </InputGroup>
                    <Button
                      leftIcon={<Icon as={BiRepeat} />}
                      px={6}
                      w="100"
                      onClick={() => {
                        setInventoryLookupType(
                          inventoryLookupType === 'active'
                            ? 'inactive'
                            : inventoryLookupType === 'inactive'
                            ? 'all'
                            : 'active',
                        );

                        setChanges({});
                      }}
                    >
                      {inventoryLookupType === 'active'
                        ? 'Active'
                        : inventoryLookupType === 'inactive'
                        ? 'Inactive'
                        : 'All'}
                    </Button>
                  </Stack>
                </Stack>
              )}

              <HStack>
                <TextInput
                  value={changes.vin}
                  name="vin"
                  isDisabled={searchingVin}
                  setChanges={setChanges}
                  changes={changes}
                  isInvalid={changes.vin?.length !== 17}
                />
                <Button
                  isLoading={searchingVin}
                  leftIcon={<Icon as={BiSearch} />}
                  onClick={searchVin}
                >
                  Search
                </Button>
              </HStack>

              <Stack direction={['column', 'row']} spacing={'15px'}>
                <FormControl id="year" isRequired>
                  <NumberInput
                    max={new Date().getFullYear() + 2}
                    min={1769}
                    keepWithinRange={true}
                    clampValueOnBlur={true}
                    value={changes.year?.toString().replace('.0', '') || ''}
                    name="year"
                    onChange={(value) => setChanges({ ...changes, year: value })}
                    textTransform="uppercase"
                  >
                    <NumberInputField placeholder="YEAR" />
                  </NumberInput>
                </FormControl>
                <TextInput
                  value={changes.make || ''}
                  changes={changes}
                  setChanges={setChanges}
                  name={'make'}
                  isRequired
                />
                <TextInput
                  value={changes.model || ''}
                  changes={changes}
                  setChanges={setChanges}
                  name={'model'}
                  isRequired
                />
              </Stack>

              {/* color, fuel, mileage */}
              <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                <FormControl id="fuel">
                  <Select
                    placeholder="FUEL"
                    value={changes.fuel || 'GASOLINE'}
                    onChange={(e) =>
                      setChanges({
                        ...changes,
                        ['fuel']: e.target.value,
                      })
                    }
                  >
                    <option value="GASOLINE">GASOLINE</option>
                    <option value="DIESEL">DIESEL</option>
                    <option value="ELECTRIC">ELECTRIC</option>
                    <option value="HYBRID">HYBRID</option>
                  </Select>
                </FormControl>
                {/* <FormControl id="color">
          <Input
            placeholder="color"
            textTransform="uppercase"
            value={changes["color"] || ""}
            onChange={(e) => setChanges({ ...changes, color: e.target.value })} />
        </FormControl> */}
                <TextInput
                  changes={changes}
                  setChanges={setChanges}
                  name={'color'}
                  value={changes?.color || ''}
                />
                <TextInput
                  changes={changes}
                  setChanges={setChanges}
                  name={'mileage'}
                  isRequired={mileageExempt}
                  tooltip={mileageExempt ? 'Mileage exempt' : undefined}
                  value={mileageExempt ? 'EXEMPT' : changes?.mileage || ''}
                  inputElement={
                    changes?.mileage && !mileageExempt
                      ? {
                          side: 'right',
                          element: <InputRightElement>mi</InputRightElement>,
                        }
                      : undefined
                  }
                />
              </Stack>

              <Divider />

              {/* Cash, Credit, Down */}
              {includePrices && (
                <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                  <CurrencyInput
                    formLabel="Cash"
                    name={Number(changes.cash || 0)}
                    onChange={(valueAsString, _valueAsNumber) =>
                      setChanges({ ...changes, cash: valueAsString })
                    }
                  />
                  <CurrencyInput
                    formLabel="Credit"
                    name={Number(changes.credit || 0)}
                    onChange={(valueAsString, _valueAsNumber) =>
                      setChanges({ ...changes, credit: valueAsString })
                    }
                  />
                  <CurrencyInput
                    formLabel="Down"
                    name={Number(changes.down || 0)}
                    min={0}
                    // max={+getValue('cash') ?? +getValue('credit')}
                    max={+(changes.cash || changes.credit || 0)}
                    onChange={(valueAsString, _valueAsNumber) =>
                      setChanges({ ...changes, down: valueAsString })
                    }
                  />
                </Stack>
              )}
            </Stack>
            <ButtonGroup
              pt={8}
              alignItems={'center'}
              justifyContent={'space-around'}
              spacing={4}
            >
              <Button
                w={'50%'}
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={loading}
              >
                Save
              </Button>
              <Button
                onClick={handleClose}
                colorScheme="red"
                variant={'outline'}
                size="md"
                w={'25%'}
                fontSize="md"
                isLoading={loading}
              >
                Close
              </Button>
            </ButtonGroup>
          </Stack>
        </TabPanel>
        {
          <TabPanel p={0} h={'100%'}>
            {/*<pre>*/}
            {/*  {JSON.stringify(vinLookup ?? 'Enter a VIN to search', null, 2)}*/}
            {/*</pre>*/}
            <TableContainer>
              <Table>
                <Tbody>
                  {Object.entries(vinLookup ?? {}).map(([key, value]) => {
                    return (
                      <Tr key={key}>
                        <Divider />
                        <Th>
                          <Tooltip label={key} aria-label={key}>
                            <Box as="span" fontWeight="bold">
                              {key}
                            </Box>
                          </Tooltip>
                        </Th>
                        <Td>
                          <Tooltip label={value} aria-label={value}>
                            <Box as="span">{value}</Box>
                          </Tooltip>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          </TabPanel>
        }
      </TabPanels>
    </Tabs>
  );
};

export default memo(InventoryForm);
