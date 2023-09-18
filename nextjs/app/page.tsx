import { redirect } from 'next/navigation';
import { getRequestCookie } from '@/utils/auth/getRequestCookie';
import { cookies } from 'next/headers';
import HomePage from '@/app/HomePage';

const Page = async () => {
  const user = await getRequestCookie(cookies());
  if (!user) {
    redirect('/auth/login');
  }

  return <HomePage />;
};

export default Page;
