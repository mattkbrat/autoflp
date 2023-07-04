import { Inter } from 'next/font/google';

import { Providers } from '@/app/providers';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Auto FLP',
  description: 'Auto Dealership Management Software for Family-Owned Dealerships',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
