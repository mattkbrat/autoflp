import { redirect } from 'next/navigation';
import { DealForm } from '@/components/forms/DealForm';

const DefaultDealPage = () => {
  return <DealForm id={''} />;
};

export default DefaultDealPage;
