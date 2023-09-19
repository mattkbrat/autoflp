import paidThisMonth from '@/utils/finance/paidThisMonth';
import { getPayments } from '@/utils/prisma/payment';

// My payment dates are stored as strings, so we need to convert them to Date objects.
// I would otherwise just use the sql sum function.
const totalPaidAtMonth = async (month: number, year: number) => {
  const payments = await getPayments();

  return payments
    .filter((payment) => {
      const paymentDate = new Date(payment.date);
      return paymentDate.getMonth() === month && paymentDate.getFullYear() === year;
    })
    .reduce((acc, cur) => acc + +cur.amount, 0);
};

export default totalPaidAtMonth;
