import { default as Admin } from '@/app/admin/AdminPage';
import { getBilling } from '@/utils/finance/getBilling';
import { getRequestCookie } from '@/utils/auth/getRequestCookie';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const AdminPage = async () => {
  const user = await getRequestCookie(cookies());
  if (!user) {
    redirect('/auth/login');
  }

  const billing = await getBilling();

  return <Admin billing={billing} />;
};

export default AdminPage;
