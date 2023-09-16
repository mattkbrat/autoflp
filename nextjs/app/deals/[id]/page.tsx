import { redirect } from 'next/navigation';
import BackgroundLayout from '@/components/layouts/BackgroundLayout';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import PersonForm from '@/components/forms/PersonForm';
import AccountForm from '@/components/forms/AccountForm';
import getPerson from '@/utils/prisma/person/getPerson';
import { getAccountWithRelevant } from '@/utils/prisma/account';
import { getRequestCookie } from '@/utils/auth/getRequestCookie';
import { cookies } from 'next/headers';

export const generateMetadata = async ({ params }: { params: { id: string } }) => {
  const person = await getPerson({ id: params.id });

  const fullName = person ? fullNameFromPerson(person) : '';

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
  const user = await getRequestCookie(cookies());
  if (!user) {
    redirect('/auth/login');
  }

  const id = params.id;

  if (!id) {
    redirect('/accounts');
  }

  const account = await getAccountWithRelevant({ id });

  if (!account) {
    redirect('/accounts');
  }

  const name = fullNameFromPerson(account.person);

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
