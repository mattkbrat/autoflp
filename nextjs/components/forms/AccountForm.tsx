'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button, HStack, Stack, useToast } from '@chakra-ui/react';
import { account, person } from '@prisma/client';
import { TextInput } from '@/components/Inputs/TextInput';

/*

The account form should have the following fields:
  date_of_birth      String?
  license_number     String? @unique(map: "sqlite_autoindex_account_3")
  license_expiration String?
*/

function Account(props: {
  defaultCollapsed?: boolean;
  redirectOnSubmit?: boolean;
  editing: account;
}) {
  const { defaultCollapsed = false, editing } = props;
  const [changes, setChanges] = useState<Partial<account>>(editing);
  const [message, setMessage] = useState<string>('');

  const router = useRouter();

  const toast = useToast();

  const pid = changes.contact;

  async function onSubmit(e: React.FormEvent<HTMLDivElement>) {
    e.preventDefault();

    if (!pid) {
      throw 'Person ID is required.';
    }

    const submitted = await fetch('/api/accounts', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...changes,
        contact: pid,
      }),
    });

    toast({
      title: submitted.ok ? 'Success!' : 'Error!',
      description: submitted.ok ? 'Account saved.' : 'Account not saved.',
      status: submitted.ok ? 'success' : 'error',
      duration: 5000,
    });
  }

  return (
    <Stack as={'form'} onSubmit={onSubmit} spacing={{ base: 4, md: 6 }} px={2}>
      <Stack direction={{ base: 'column', md: 'row' }}>
        <TextInput
          label={'Date of Birth'}
          defaultValue={'1970-01-01'}
          changes={changes}
          setChanges={setChanges}
          name={'date_of_birth'}
          isRequired
        />
        <TextInput
          label={'License Number'}
          defaultValue={'123456789'}
          changes={changes}
          setChanges={setChanges}
          name={'license_number'}
          isRequired
        />
        <TextInput
          label={'License Expiration'}
          defaultValue={new Date().toString()}
          changes={changes}
          setChanges={setChanges}
          name={'license_expiration'}
          isRequired
        />
      </Stack>
      <TextInput
        label={'Cosigner'}
        changes={changes}
        setChanges={setChanges}
        name={'cosigner'}
      />
      <Button type={'submit'} colorScheme={'blue'}>
        Submit
      </Button>
    </Stack>
  );
}

export default Account;
