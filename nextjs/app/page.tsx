import Image from 'next/image';
import { Inter } from 'next/font/google';
import styles from './page.module.css';
import getAll, { getAllWithRelevant } from '@/utils/prisma/accounts';
import AccountTable from '@/components/table/AccountTable';
import { getRequestCookie } from '@/utils/auth/getRequestCookie';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default async function HomePage() {
  const user = await getRequestCookie(cookies());

  if (!user) {
    redirect('/auth/login');
  }

  const accounts = await getAllWithRelevant();
  console.info('home');

  return (
    <main>
      <AccountTable data={accounts} />
    </main>
  );
}
