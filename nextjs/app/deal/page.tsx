import { redirect } from 'next/navigation';
import { DealForm } from '@/components/forms/DealForm';
import { getBusinessData } from '@/utils/formBuilder/functions';

const DefaultDealPage = () => {
  return <DealForm businessData={getBusinessData()} id={''} />;
};

export default DefaultDealPage;
