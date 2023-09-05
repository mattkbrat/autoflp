import { DealWithPayments } from '@/types/prisma/deals';
import { datePlusMonths } from '@/utils/date';

const paidThisMonth = ({
  payments,
  atMonth,
}: {
  payments: NonNullable<DealWithPayments>[number]['payments'];
  atMonth: number;
}) => {
  return (payments || [])
    .filter((payment) => {
      const paymentDate = new Date(payment.date);

      return (
        paymentDate.getMonth() ===
          (atMonth
            ? new Date(datePlusMonths(new Date(), atMonth))
            : new Date()
          ).getMonth() &&
        paymentDate.getFullYear() ===
          (atMonth
            ? new Date(datePlusMonths(new Date(), atMonth))
            : new Date()
          ).getFullYear()
      );
    })
    .reduce((acc, cur) => acc + +cur.amount, 0);
};

export default paidThisMonth;
