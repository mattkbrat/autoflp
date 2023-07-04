import { getOne, getOneWithRelevant } from '@/utils/prisma/accounts';
import { redirect } from 'next/navigation';
import BackgroundLayout from '@/components/layouts/BackgroundLayout';
import { getPersonByAccountId } from '@/utils/prisma/person';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import { addressFromPerson } from '@/utils/format/addressFromPerson';
import PersonForm from '@/components/forms/PersonForm';
import { useColorMode, useColorModeValue } from '@chakra-ui/react';
import AccountForm from '@/components/forms/AccountForm';

export const generateMetadata = async ({ params }: { params: { id: string } }) => {
  console.info(params);
  const person = await getPersonByAccountId(params.id);

  const fullName = fullNameFromPerson(person);

  return {
    title: `Auto FLP | ${fullName}`,
    description: 'Manage Account',
  };
};

export default async function ManageAccountPage({
  params,
}: {
  params: { id?: string };
}) {
  const id = params.id;

  if (!id) {
    redirect('/accounts');
  }

  const account = await getOneWithRelevant(id);

  if (!account) {
    redirect('/accounts');
  }

  const name = fullNameFromPerson(account.person);

  const address = account.person && addressFromPerson(account.person);

  return (
    <BackgroundLayout
      withGradient
      heading={name}
      w="70%"
      backgroundImage={'gradient'}
    >
      <section>
        <h2>Contact Information</h2>
        <PersonForm editing={account.person} />
        <AccountForm editing={account} />
      </section>
      <pre>{JSON.stringify(account, null, 2)}</pre>
    </BackgroundLayout>
  );
}
