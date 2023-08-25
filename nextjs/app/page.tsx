import { redirect } from 'next/navigation';
import { getRequestCookie } from '@/utils/auth/getRequestCookie';
import { cookies } from 'next/headers';

const Page = async () => {
  const user = await getRequestCookie(cookies());
  if (!user) {
    redirect('/auth/login');
  }

  return <div> Home </div>;
};

export default Page;
