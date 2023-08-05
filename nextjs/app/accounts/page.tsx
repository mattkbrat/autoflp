import { Inter } from 'next/font/google';
import AccountTable from '@/components/table/AccountTable';
import { getRequestCookie } from '@/utils/auth/getRequestCookie';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAllAccountsWithRelevantByOptionalStatus } from '@/utils/prisma/account';

const inter = Inter({ subsets: ['latin'] });

export default async function HomePage() {
  const user = await getRequestCookie(cookies());

  if (!user) {
    redirect('/auth/login');
  }

  const accounts = await getAllAccountsWithRelevantByOptionalStatus({});

  return (
    <main>
      <AccountTable data={accounts} />
    </main>
  );
}
