import totalPaid from './totalPaid';
import { DealPayments, DealWithPayments } from '@/types/prisma/deals';
import monthsBetween from '@/utils/date/monthsBetween';
import { datePlusMonths, monthsBetweenDates } from '@/utils/date';
import paidThisMonth from '@/utils/finance/paidThisMonth';

const returnObj = {
  totalDelinquent: 0,
  totalExpectedAtDate: 0,
  totalPaidAmount: 0,
  paidThisMonth: 0,
};

// function delinquent(deal: DealWithPayments[number], atMonth = 1) {
//   // Payments are expected to begin starting one month after the deal date.
//   if (atMonth === 0) {
//     return returnObj;
//   }
//
//   if (deal === null || deal.pmt === null || deal.lien === null) return returnObj;
//
//   // Calculate the total paid
//   const payments = (deal.payments || []).map(
//     (payment) => +payment.amount,
//   ) as number[];
//   const totalPaidAmount = totalPaid(payments);
//
//   const totalExpectedAtDate = Math.abs(
//     +deal.pmt *
//       Math.min(
//         monthsBetween(
//           atMonth ? new Date(datePlusMonths(new Date(), atMonth)) : new Date(),
//           new Date(deal.date),
//         ),
//         +deal.term,
//       ),
//   );
//
//   // Calculate the total delinquent
//   const totalDelinquent = Math.min(
//     totalExpectedAtDate - totalPaidAmount,
//     +(deal.finance ?? 0) - totalPaidAmount,
//   );
//
//   // * The delinquent balance is calculated as the principal difference between the total expected at date minus the total amount paid.
//
//   return {
//     totalDelinquent: totalDelinquent > 0 ? totalDelinquent : 0,
//     totalExpectedAtDate,
//     totalPaidAmount,
//     paidThisMonth: paidThisMonth({ payments: deal.payments, atMonth: atMonth }),
//   };
// }

// def delinquent(month: int, payments):
//     plus_one_month_delta = dateutil.relativedelta.relativedelta(months=1)
//     deal_date = datetime.strptime(customer['date'], '%Y-%m-%d %H:%M:%S.%f') + plus_one_month_delta  # payments start one month after the deal date
//
//     delta = dateutil.relativedelta.relativedelta(months=month)
//     check_date = deal_date + delta
//
//     total_paid = sum([float(payment['amount']) for payment in payments if datetime.strptime(payment['date'], '%Y-%m-%dT%H:%M:%S.%fZ') < check_date])
//     lien = float(customer['lien'])
//
//     expected_payment = float(customer['pmt'])
//     term = min(float(customer['term']), month)
//
//     # min of expected payment and lien
//     expected_paid = min(expected_payment * term, lien)
//
//     return expected_paid - total_paid

function delinquent(deal: DealPayments, month: number | undefined = undefined) {
  if (typeof month === 'undefined') {
    month = Math.min(
      monthsBetweenDates(new Date(deal.date), new Date()) - 1,
      Number(deal.term),
    );
    // month = new Date().getMonth();
  }

  // console.log(
  //   'Getting delinquent balance for',
  //   deal.Account.person.last_name,
  //   deal.Account.person.first_name,
  //   'at month',
  //   month,
  // );

  const checkDate = datePlusMonths(deal.date, month + 1);

  const payments = deal.payments;

  const totalPaid = payments
    .filter((p) => new Date(p.date) <= checkDate)
    .reduce((acc, p) => acc + Number(p.amount), 0);

  const lien = Number(deal.lien);

  const pmt = Number(deal.pmt);

  const term = Math.min(Number(deal.term), month);

  const expectedPaid = Math.min(pmt * term, lien);

  returnObj.totalDelinquent = expectedPaid - totalPaid;
  returnObj.totalExpectedAtDate = expectedPaid;
  returnObj.totalPaidAmount = totalPaid;
  returnObj.paidThisMonth = paidThisMonth({ payments, atMonth: month });

  // console.log({
  //   fullname: `${deal.Account.person.first_name} ${deal.Account.person.last_name}`,
  //   totalDelinquent: returnObj.totalDelinquent,
  //   totalExpectedAtDate: returnObj.totalExpectedAtDate,
  //   totalPaidAmount: returnObj.totalPaidAmount,
  //   paidThisMonth: returnObj.paidThisMonth,
  //   term,
  //   dealDate: deal.date,
  //   checkDate,
  // });

  return returnObj;
}

export default delinquent;
