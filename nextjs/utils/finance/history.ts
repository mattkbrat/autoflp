import calcDelinquent from './delinquent';
import financeFormat from './format';
import formatDate from '@/utils/date/format';
import type { DealWithPayments } from '@/types/prisma/deals';
import { Override } from '@/types/Oerride';
import { DealPayments } from '@/types/prisma/deals';

function financeHistory(
  pmt: DealPayments,
): {
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

  return (pmt.payments || []).map((payment, index) => {
    const { date, amount } = payment;
    const delinquentAmount = calcDelinquent(pmt, index)?.totalDelinquent || 0;
    totalDelinquent += delinquentAmount;
    // Owed is the total amount of the loan, minus the total amount paid plus the total amount delinquent.
    owed = owed - +amount;
    const dateFormatted = formatDate(date, 'MM/dd/yyyy');
    const owedFormatted = financeFormat({
      num: owed,
    });
    const balance = financeFormat({
      num: owed + +amount,
    });
    const delinquentFormatted = financeFormat({
      num: delinquentAmount,
    });

    const amountFormatted = financeFormat({
      num: +amount,
    });

    return {
      key: index,
      date: dateFormatted,
      owed: owedFormatted,
      paid: amountFormatted,
      balance: balance,
      delinquentAmount: delinquentFormatted,
    };
  });
}

export default financeHistory;
