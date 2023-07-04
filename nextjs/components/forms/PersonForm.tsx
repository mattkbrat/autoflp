'use client';

import React, { SetStateAction, useEffect, useState } from 'react';

import {
  Box,
  Button,
  Heading,
  HStack,
  Stack,
  StackDivider,
  Text,
} from '@chakra-ui/react';
import { account, person } from '@prisma/client';
import { BasicTextInput } from '@/components/Inputs/BasicTextInput';

/*

  id              String     @id
  name_prefix     String?
  first_name      String
  middle_initial  String?
  last_name       String
  name_suffix     String?
  address_1       String
  address_2       String?
  address_3       String?
  city            String     @default("Fort Morgan")
  state_province  String     @default("CO")
  zip_postal      String     @default("80701")
  zip_4           String?
  country         String     @default("US")
  phone_primary   String
  phone_secondary String?
  phone_tertiary  String?
  email_primary   String?
  email_secondary String?

*/
const PersonForm = ({ editing }: { editing: person }) => {
  const [changes, setChanges] = useState<Partial<person>>(editing);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChanges((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log(changes);
  };

  return (
    <Stack
      onSubmit={handleSubmit}
      as={'form'}
      w={'full'}
      spacing={{ base: 4, md: 6 }}
      px={2}
    >
      <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 4, md: 6 }}>
        <BasicTextInput
          name="name_prefix"
          label="prefix"
          changes={changes}
          setChanges={setChanges}
        />
        <BasicTextInput
          isRequired
          name="first_name"
          label="first"
          changes={changes}
          setChanges={setChanges}
        />
        <BasicTextInput
          name="middle_initial"
          label="m i"
          changes={changes}
          setChanges={setChanges}
        />
        <BasicTextInput
          isRequired
          name="last_name"
          label="last"
          changes={changes}
          setChanges={setChanges}
        />
        <BasicTextInput
          name="name_suffix"
          label="suffix"
          changes={changes}
          setChanges={setChanges}
        />
      </Stack>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 4, md: 6 }}>
        <BasicTextInput
          isRequired
          name="address_1"
          label="address 1"
          changes={changes}
          setChanges={setChanges}
        />
        <BasicTextInput
          name="address_2"
          label="address 2"
          changes={changes}
          setChanges={setChanges}
        />
        <BasicTextInput
          name="address_3"
          label="address 3"
          changes={changes}
          setChanges={setChanges}
        />
      </Stack>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 0, md: 4 }}>
        <BasicTextInput
          isRequired
          name="city"
          label="city"
          changes={changes}
          setChanges={setChanges}
        />
        <BasicTextInput
          isRequired
          name="state_province"
          label="state"
          changes={changes}
          setChanges={setChanges}
        />
        <BasicTextInput
          isRequired
          name="zip_postal"
          label="zip"
          changes={changes}
          setChanges={setChanges}
        />
        <BasicTextInput
          name="zip_4"
          label="zip 4"
          changes={changes}
          setChanges={setChanges}
        />
      </Stack>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 4, md: 6 }}>
        <BasicTextInput
          isRequired
          name="country"
          label="country"
          changes={changes}
          setChanges={setChanges}
        />
        <BasicTextInput
          isRequired
          name="phone_primary"
          label="primary"
          changes={changes}
          setChanges={setChanges}
        />
        <BasicTextInput
          name="phone_secondary"
          label="secondary"
          changes={changes}
          setChanges={setChanges}
        />
        <BasicTextInput
          name="phone_tertiary"
          label="tertiary"
          changes={changes}
          setChanges={setChanges}
        />
      </Stack>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 4, md: 6 }}>
        <BasicTextInput
          name="email_primary"
          label="primary email"
          changes={changes}
          setChanges={setChanges}
        />
        <BasicTextInput
          name="email_secondary"
          label="secondary email"
          changes={changes}
          setChanges={setChanges}
        />
      </Stack>
      <Button type="submit" colorScheme="blue" size="lg" fontSize="md">
        Save
      </Button>
    </Stack>
  );
};

export default PersonForm;
