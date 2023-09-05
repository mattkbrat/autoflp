import { default as Admin } from '@/app/admin/AdminPage';
import { getBilling } from '@/utils/finance/getBilling';

const AdminPage = async () => {
  const billing = await getBilling();

  return <Admin billing={billing} />;
};

export default AdminPage;
