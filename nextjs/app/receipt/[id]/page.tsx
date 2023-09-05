import AmortizationSchedule from '@/components/AmortizationSchedule';
import isDev from '@/lib/isDev';
import { getBusinessData } from '@/utils/formBuilder/functions';

const ReceiptPage = ({
  params,
}: {
  params: {
    id: string;
  };
}) => {
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
