import { DealsPaymentsPayments } from '@/types/prisma/deals';
import { Override } from '@/types/Oerride';

const sameMonthAndYear = (date1: Date | string, date2: Date | string) => {
  date1 = new Date(date1);
  date2 = new Date(date2);
  return (
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

type PaymentsOverride = Override<
  DealsPaymentsPayments[number],
  {
    date: Date;
    amount: number;
  }
>;

const collapsePayments = (payments: DealsPaymentsPayments) => {
  const paymentsCollapsed: PaymentsOverride[] = [];

  for (const payment of payments) {
    const found = paymentsCollapsed.find((p) =>
      sameMonthAndYear(p.date, payment.date),
    );
    if (found) {
      const indexOf = paymentsCollapsed.indexOf(found);
      paymentsCollapsed[indexOf].amount += +payment.amount;
    } else {
      const date = new Date(payment.date);
      paymentsCollapsed.push({
        ...payment,
        date: new Date(date.getFullYear(), date.getMonth(), 1),
        amount: +payment.amount,
      });
    }
  }

  return paymentsCollapsed;
};

export default collapsePayments;
