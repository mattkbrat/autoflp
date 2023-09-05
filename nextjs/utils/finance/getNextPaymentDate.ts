import { datePlusMonths, monthsBetweenDates } from '@/utils/date';

const getNextPaymentDate = ({
  dealDate,
  hasPaidThisMonth,
  monthsDelinquent,
}: {
  dealDate: Date;
  hasPaidThisMonth: boolean;
  monthsDelinquent: number;
}) => {
  dealDate = new Date(dealDate);

  const monthsSinceDeal =
    monthsBetweenDates(dealDate, new Date()) + (hasPaidThisMonth ? 0 : 1);

  // If the account is paid more than a month in advance, then the next payment date should be dated x months plus today.
  if (monthsDelinquent < -1) {
    // console.log(
    //   "Account is paid more than a month in advance, so we're adding the months since deal to the date of the deal.",
    //   {
    //     monthsDelinquent,
    //     customer,
    //   },
    // );
    return datePlusMonths(dealDate, monthsSinceDeal + Math.abs(monthsDelinquent));
  } else {
    return datePlusMonths(dealDate, monthsSinceDeal);
  }
};

export default getNextPaymentDate;
