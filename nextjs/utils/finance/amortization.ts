import _ from 'lodash';
import { datePlusMonths, monthsBetweenDates } from '@/utils/date';
import type {
  FinanceCalcResult,
  FinanceHistory,
  ScheduleRow,
} from '@/types/Schedule';

function amortizationSchedule({
  principal,
  numberOfPayments,
  annualRate,
  pmt,
  history,
  finance,
}: {
  principal: number;
  annualRate: number;
  numberOfPayments: number;
  pmt: number;
  history?: FinanceHistory;
  finance: FinanceCalcResult;
}) {
  const monthlyRate = (annualRate > 0 ? annualRate / 100 : 1) / 12;
  const startDate: Date = new Date(finance.firstPaymentDueDate);
  const endDate: Date = datePlusMonths(startDate, numberOfPayments) as Date;

  let totalPaid = 0;

  let balance = finance.financeAmount;

  if (history) {
    numberOfPayments = history.length;
  }

  const tempSchedule: ScheduleRow[] = [];

  // Create an array of payment objects with date only
  let rows;

  if (history) {
    rows = monthsBetweenDates(startDate, new Date()) + 1;
  } else {
    rows = numberOfPayments;
  }

  for (let i = 0; i < rows; i++) {
    // Create a date with month of initial date and day of 1.
    // Increment the date by an additional month,
    // as the first payment date is one month after the purchase date.
    const date = datePlusMonths(startDate, i) as Date;

    const payment: number[] = [];

    tempSchedule.push({
      date,
      payment,
      i: i + 1,
      expected: pmt,
    });
  }

  const paymentsBeforeStart: number[] = [];

  history?.forEach((payment) => {
    const dateCheck = new Date(payment.date);

    if (dateCheck < startDate) {
      paymentsBeforeStart.push(+payment.paid);
      return;
    }

    const monthsBetween = monthsBetweenDates(startDate, dateCheck);

    const scheduleItemIndex = tempSchedule.findIndex(
      (item) =>
        item.date.getMonth() === dateCheck.getMonth() &&
        item.date.getFullYear() === dateCheck.getFullYear(),
    );

    if (typeof scheduleItemIndex === 'undefined') {
      console.error('Payment is outside of the schedule');
      console.table({
        payment,
        dateCheck,
        monthsBetween,
      });
      return;
    }

    if (scheduleItemIndex === -1) {
      console.error('Payment is outside of the schedule');
      console.table({
        payment,
        dateCheck,
        monthsBetween,
      });
      return;
    }

    tempSchedule[scheduleItemIndex].payment.push(+payment.paid);
    totalPaid += +payment.paid;
  });

  for (let i = 0; i < tempSchedule.length; i++) {
    const beginningBalance = balance;
    let interest = balance * monthlyRate;
    if (i === 0) {
      tempSchedule[i].payment = [...paymentsBeforeStart, ...tempSchedule[i].payment];
    }

    let payments = tempSchedule[i].payment.reduce((a, b) => a + b, 0);

    if (typeof history === 'undefined') {
      payments = pmt;
    }

    // Round to nearest cent
    payments = Math.round(payments * 100) / 100;

    let principal = payments - interest;

    // Do not penalize for late payments.
    if (payments < pmt) {
      principal = Math.max(0, principal);
      interest = Math.max(0, interest);
    }

    balance -= principal;

    tempSchedule[i] = {
      ...tempSchedule[i],
      principal,
      interest,
      balance,
      beginningBalance,
      total: payments,
      expected: pmt,
      // i: i+1,
    };
  }

  let lastPaymentAmount = pmt;

  // Check if the last ending is not 0. If so, update the payment amount so that
  // the ending balance is 0

  const lastPayment = tempSchedule[tempSchedule.length - 1];

  if (!_.inRange(+(lastPayment.balance ?? 0), -0.01, 0.01)) {
    const newPayment = (lastPayment.total ?? 0) + (lastPayment.balance ?? 0);

    if (_.inRange(newPayment, pmt + 10, pmt - 10)) {
      // lastPaymentAmount = newPayment;
      const newPrincipal = (lastPayment.principal ?? 0) + (lastPayment.balance ?? 0);
      const newBalance = 0;

      tempSchedule[tempSchedule.length - 1] = {
        ...lastPayment,
        total: newPayment,
        principal: newPrincipal,
        balance: Math.abs(newBalance),
        expected: newPayment,
      };
    }
  }

  return {
    pmt,
    principal: Math.max(principal, 0),
    schedule: tempSchedule,
    startDate,
    endDate,
    paymentsBeforeStart,
    totalPaid,
  };
}

export { amortizationSchedule };
