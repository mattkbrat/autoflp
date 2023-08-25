import { Inter } from 'next/font/google';

import { Providers } from '@/app/providers';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import formatInventory from '@/utils/format/formatInventory';
import { SearchOption } from '@/app/GlobalSearch';
import dynamic from 'next/dynamic';
import prisma from '@/lib/prisma';
import { getAccounts } from '@/utils/prisma/account';

const inter = Inter({ subsets: ['latin'] });

const Header = dynamic(() => import('@/components/Header'), {
  ssr: false,
});

export const metadata = {
  title: 'Auto FLP',
  description: 'Auto Dealership Management Software for Family-Owned Dealerships',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const accounts = (await getAccounts({ withPerson: true })).map((account) => {
    return {
      id: account.id,
      person: fullNameFromPerson(account.person),
    };
  });

  const inventory = (
    await prisma.inventory.findMany({
      orderBy: {
        make: 'asc',
      },
    })
  ).map((inventory) => {
    return {
      id: inventory.id,
      person: formatInventory(inventory),
    };
  });

  const searchOptions: SearchOption[] = accounts
    .map((account) => {
      return {
        display: account.person,
        path: `/accounts/${account.id}`,
      };
    })
    .concat(
      inventory.map((inventory) => {
        return {
          display: inventory.person,
          path: `/inventory/${inventory.id}`,
        };
      }),
    );

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header searchOptions={searchOptions} />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
