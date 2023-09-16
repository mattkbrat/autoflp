import AmortizationSchedule from '@/components/AmortizationSchedule';
import isDev from '@/lib/isDev';
import { getBusinessData } from '@/utils/formBuilder/functions';
import { getRequestCookie } from '@/utils/auth/getRequestCookie';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ReceiptPage = async ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
  const user = await getRequestCookie(cookies());
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <AmortizationSchedule
      businessData={getBusinessData()}
      defaultPrint={true}
      id={params.id}
      defaultShow={true}
    />
  );
};

export default ReceiptPage;
