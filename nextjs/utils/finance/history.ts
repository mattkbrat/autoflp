import calcDelinquent from './delinquent';
import financeFormat from './format';
import formatDate from '@/utils/date/format';
import type { DealWithPayments } from '@/types/prisma/deals';

function financeHistory(pmt: NonNullable<DealWithPayments>): {
  date: string;
  owed: string;
  paid: string;
  balance: string;
  delinquentAmount: string;
  key: number;
}[] {
  if (pmt === null || pmt.pmt === null || pmt.lien === null) {
    console.error({ pmt });
    return [];
  }

  let owed = +pmt.lien;
  let totalDelinquent = 0;

  return pmt.payments.map((payment, index) => {
    const { date, amount } = payment;
    const delinquentAmount = calcDelinquent(pmt, index)?.totalDelinquent || 0;
    totalDelinquent += delinquentAmount;
    // Owed is the total amount of the loan, minus the total amount paid plus the total amount delinquent.
    owed = owed - +amount + delinquentAmount;
    return {
      key: index,
      date: formatDate(date, 'MM/dd/yyyy'),
      owed: financeFormat({
        num: owed,
      }),
      paid: amount,
      balance: '0',
      delinquentAmount: financeFormat({
        num: delinquentAmount,
      }),
    };
  });
}

export default financeHistory;
