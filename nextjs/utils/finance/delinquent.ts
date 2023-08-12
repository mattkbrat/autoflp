import totalPaid from './totalPaid';
import { DealWithPayments } from '@/types/prisma/deals';
import monthsBetween from '@/utils/date/monthsBetween';
import { datePlusMonths } from '@/utils/date';
import paidThisMonth from '@/utils/finance/paidThisMonth';

const returnObj = {
  totalDelinquent: 0,
  totalExpectedAtDate: 0,
  totalPaidAmount: 0,
  paidThisMonth: 0,
};

function delinquent(deal: DealWithPayments, atMonth = 1) {
  if (deal === null || deal.pmt === null || deal.lien === null) return returnObj;

  // Calculate the total paid
  const payments = deal.payments.map((payment) => +payment.amount) as number[];
  const totalPaidAmount = totalPaid(payments);

  const totalExpectedAtDate = Math.abs(
    +deal.pmt *
      Math.min(
        monthsBetween(
          atMonth ? new Date(datePlusMonths(new Date(), atMonth)) : new Date(),
          new Date(deal.date),
        ),
        +deal.term,
      ),
  );

  // Calculate the total delinquent
  const totalDelinquent = Math.min(
    totalExpectedAtDate - totalPaidAmount,
    +(deal.finance ?? 0) - totalPaidAmount,
  );

  // * The delinquent balance is calculated as the principal difference between the total expected at date minus the total amount paid.

  return {
    totalDelinquent: totalDelinquent > 0 ? totalDelinquent : 0,
    totalExpectedAtDate,
    totalPaidAmount,
    paidThisMonth: paidThisMonth({ payments: deal.payments, atMonth: atMonth }),
  };
}

export default delinquent;
