import Image from 'next/image';
import { Inter } from 'next/font/google';
import styles from './page.module.css';
import getAll, { getAllWithRelevant } from '@/utils/prisma/accounts';
import AccountTable from '@/components/table/AccountTable';

const inter = Inter({ subsets: ['latin'] });

export default async function HomePage() {
  const accounts = await getAllWithRelevant();

  console.info('home');

  return (
    <main>
      <AccountTable>{accounts}</AccountTable>
      <p>Accounts</p>
      <p>Accounts</p>
      <p>Accounts</p>
      <p>Accounts</p>
    </main>
  );
}
