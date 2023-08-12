import { addressFromPerson, fullNameFromPerson, getBusinessData } from './functions';
import generate from './generate';
import { getDealsWithRelevant } from '@/utils/prisma/deal';
import { Payment } from '@/types/prisma/payments';
import { delinquent, financeHistory } from '@/utils/finance';
import getCustomerStatus from '@/utils/finance/customerStatus';
import { datePlusMonths, monthsBetweenDates } from '@/utils/date';

async function generateBillingStatements() {
  const deals = await getDealsWithRelevant({ state: 1 });
  const BusinessData = getBusinessData();
  let allStatements: string[][] = [];

  // Split the deals into three chunks
  const chunkedDeals = deals.reduce((resultArray, item, index) => {
    const chunkIndex = Math.floor(index / 3);

    if (!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = [];
    }

    resultArray[chunkIndex].push(item);

    return resultArray;
  }, [] as any[][]);

  for (const chunk of chunkedDeals) {
    let statement: string[] = [];
    for (const c of chunk) {
      const customer: Extract<Payment, { id: string }> = c;
      let thisStatement = [];
      const customerName = fullNameFromPerson(customer.Account.person);

      const address = addressFromPerson({
        person: customer.Account.person,
      });

      const calculatedDelinquent = delinquent(customer);

      const monthsDelinquent = Math.floor(
        calculatedDelinquent.totalDelinquent / +(customer.pmt || 0),
      );
      const accountStatus = getCustomerStatus(monthsDelinquent);

      const dealDate = new Date(customer.date);
      const hasPaidThisMonth = calculatedDelinquent.paidThisMonth;

      const nextPayment = datePlusMonths(
        new Date(customer.date),
        monthsBetweenDates(dealDate, new Date()) + (!hasPaidThisMonth ? 1 : 0),
      );

      const history = financeHistory(customer);

      const paymentMonths = history
        .map((h) => new Date(h.date).getMonth() + 1)
        .join('\n');
      const paymentBeginBal = history.map((h) => h.balance).join('\n');
      const paymentPayment = history.map((h) => h.paid).join('\n');
      const paymentEndBal = history.map((h) => h.owed).join('\n');

      thisStatement = [
        BusinessData.businessName,
        BusinessData.street,
        BusinessData.address,
        customerName,
        address.street,
        address.cityStateZip,
        customer.inventory.make +
          ' ' +
          customer.inventory.model +
          ' ' +
          customer.inventory.year,
        'Your account status is: ' + accountStatus,
        'Your next payment is due on: ' + new Date(nextPayment).toLocaleDateString(),
        'You are ' + monthsDelinquent + ' months delinquent',
        BusinessData.businessName,
        BusinessData.businessMotto,
        BusinessData.phoneNumber,
        paymentMonths,
        paymentBeginBal,
        paymentPayment,
        paymentEndBal,
      ];

      thisStatement = thisStatement.map((s) => (s || '').toUpperCase());

      statement = [...statement, ...thisStatement];
    }

    allStatements = [...allStatements, statement];
  }

  return await generate({
    form: 'billing',
    data: allStatements,
    output: 'billing',
  });
}

export default generateBillingStatements;
