import { redirect } from 'next/navigation';
import { DealForm } from '@/components/forms/DealForm';
import { getBusinessData } from '@/utils/formBuilder/functions';
import { getRequestCookie } from '@/utils/auth/getRequestCookie';
import { cookies } from 'next/headers';

const DefaultDealPage = async () => {
  const user = await getRequestCookie(cookies());
  if (!user) {
    redirect('/auth/login');
  }

  return <DealForm businessData={getBusinessData()} id={''} />;
};

export default DefaultDealPage;
