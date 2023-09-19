import { DealPaymentsWithDate, DealWithPayments } from '@/types/prisma/deals';
import { datePlusMonths } from '@/utils/date';

const paidThisMonth = ({
  payments,
  atMonth,
}: {
  payments: DealPaymentsWithDate['payments'];
  atMonth: number;
}) => {
  return (payments || [])
    .filter((payment) => {
      const paymentDate = new Date(payment.date);
      const paymentCheckDate = new Date(
        new Date(datePlusMonths(new Date(), atMonth)).setDate(1),
      );

      return (
        paymentDate.getMonth() === paymentCheckDate.getMonth() &&
        paymentDate.getFullYear() === paymentCheckDate.getFullYear()
      );
    })
    .reduce((acc, cur) => acc + +cur.amount, 0);
};

export default paidThisMonth;
