'use client';

import { Button, Stack, Textarea, useToast } from '@chakra-ui/react';
import { TextInput } from '@/components/Inputs/TextInput';
import { useState } from 'react';
import {
  Account,
  AccountWithRelevant,
  AccountWithRelevantDealOmit,
} from '@/types/prisma/accounts';
import { useRouter } from 'next/navigation';

/*

The account form should have the following fields:
  date_of_birth      String?
  license_number     String? @unique(map: "sqlite_autoindex_account_3")
  license_expiration String?
*/

function AccountForm(props: {
  defaultCollapsed?: boolean;
  redirectOnSubmit?: boolean;
  editing: AccountWithRelevantDealOmit | null;
}) {
  const { editing } = props;

  const [changes, setChanges] = useState<Partial<Account>>({
    date_added: editing?.date_added,
    date_modified: editing?.date_modified,
    date_of_birth: editing?.date_of_birth,
    id: editing?.id,
    current_standing: editing?.current_standing,
    license_expiration: editing?.license_expiration,
    license_number: editing?.license_number,
    notes: editing?.notes,
    cosigner: editing?.cosigner,
  });
  const toast = useToast();

  async function onSubmit(e: React.FormEvent<HTMLDivElement>) {
    e.preventDefault();

    // if (!editing || !editing.id) {
    //   return;
    // }

    const method = !editing ? 'POST' : 'PUT';
    const url = !editing ? '/api/account' : `/api/account/${editing.id}`;

    const router = useRouter();

    console.log('changes', changes);

    const submitted = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(changes),
    })
      .then(async (res) => {
        return {
          ok: res.ok,
          json: await res.json(),
        };
      })
      .then((res) => {
        toast({
          title: res.ok ? 'Success!' : 'Error!',
          description: res.ok ? 'Account saved.' : 'Account not saved.',
          status: res.ok ? 'success' : 'error',
          duration: 5000,
        });
        if (method === 'POST') {
          const id = res.json.account.id;
          if (!id) return;
          router.push(`/accounts/${id}`);
        }
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
      <Textarea
        value={changes?.notes || editing?.notes || ''}
        onChange={(e) => setChanges({ ...changes, notes: e.target.value })}
        name={'notes'}
      />
      <Button type={'submit'} colorScheme={'blue'}>
        Submit
      </Button>
    </Stack>
  );
}

export default AccountForm;
