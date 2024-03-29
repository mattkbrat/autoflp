'use client';

import React, { useState } from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { TextInput } from '@/components/Inputs/TextInput';
import { Person } from '@/types/prisma/person';
import { useRouter } from 'next/navigation';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';

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
const PersonForm = ({ editing }: { editing: Person | null }) => {
  const [changes, setChanges] = useState<Partial<Person>>(editing || {});

  const router = useRouter();
  const toast = useToast();

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setChanges((prev: Partial<Person>) => ({ ...prev, [name]: value }));
  // };

  const handleSubmit = (e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();

    const method = !editing ? 'POST' : 'PUT';
    const url = !editing ? '/api/person' : `/api/person/${editing.id}`;

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(changes),
    }).then(async (res) => {
      toast({
        title: res.ok ? 'Saved' : 'Error',
        description: res.ok
          ? 'Your changes have been saved'
          : 'Something went wrong',
        status: res.ok ? 'success' : 'error',
        duration: 5000,
        isClosable: true,
      });
      if (method === 'POST') {
        const response = await res.json();
        const id = response.account.id;

        if (id) {
          router.push(`/accounts/${id}`);
        }

        return;
      }
      res.ok && router.refresh();
    });
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
        <TextInput
          name="name_prefix"
          label="prefix"
          changes={changes}
          setChanges={setChanges}
        />
        <TextInput
          isRequired
          name="first_name"
          label="first"
          changes={changes || {}}
          setChanges={setChanges}
        />
        <TextInput
          name="middle_initial"
          label="m i"
          changes={changes}
          setChanges={setChanges}
        />
        <TextInput
          isRequired
          name="last_name"
          label="last"
          changes={changes}
          setChanges={setChanges}
        />
        <TextInput
          name="name_suffix"
          label="suffix"
          changes={changes}
          setChanges={setChanges}
        />
      </Stack>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 4, md: 6 }}>
        <TextInput
          isRequired
          name="address_1"
          label="address 1"
          changes={changes}
          setChanges={setChanges}
        />
        <TextInput
          name="address_2"
          label="address 2"
          changes={changes}
          setChanges={setChanges}
        />
        <TextInput
          name="address_3"
          label="address 3"
          changes={changes}
          setChanges={setChanges}
        />
      </Stack>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 0, md: 4 }}>
        <TextInput
          isRequired
          name="city"
          label="city"
          changes={changes}
          setChanges={setChanges}
        />
        <TextInput
          isRequired
          name="state_province"
          label="state"
          changes={changes}
          setChanges={setChanges}
        />
        <TextInput
          isRequired
          name="zip_postal"
          label="zip"
          changes={changes}
          setChanges={setChanges}
        />
        <TextInput
          name="zip_4"
          label="zip 4"
          changes={changes}
          setChanges={setChanges}
        />
      </Stack>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 4, md: 6 }}>
        <TextInput
          isRequired
          name="country"
          label="country"
          changes={changes}
          setChanges={setChanges}
        />
        <TextInput
          isRequired
          name="phone_primary"
          label="primary"
          changes={changes}
          setChanges={setChanges}
        />
        <TextInput
          name="phone_secondary"
          label="secondary"
          changes={changes}
          setChanges={setChanges}
        />
        <TextInput
          name="phone_tertiary"
          label="tertiary"
          changes={changes}
          setChanges={setChanges}
        />
      </Stack>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 4, md: 6 }}>
        <TextInput
          name="email_primary"
          label="primary email"
          changes={changes}
          setChanges={setChanges}
        />
        <TextInput
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
