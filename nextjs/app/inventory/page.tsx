import InventoryForm from '@/components/forms/InventoryForm';
import { getRequestCookie } from '@/utils/auth/getRequestCookie';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const InventoryPage = async () => {
  const user = await getRequestCookie(cookies());
  if (!user) {
    redirect('/auth/login');
  }

  return <InventoryForm />;
};

export default InventoryPage;
