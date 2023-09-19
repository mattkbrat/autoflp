import generate from './generate';
import { closeDeals, getDeals, getDealsWithRelevant } from '@/utils/prisma/deal';
import { DealPayment } from '@/types/prisma/payments';
import { delinquent, financeHistory } from '@/utils/finance';
import getCustomerStatus from '@/utils/finance/customerStatus';
import { datePlusMonths, monthsBetweenDates } from '@/utils/date';
import { getBusinessData } from '@/utils/formBuilder/functions';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import { addressFromPerson } from '@/utils/format/addressFromPerson';
import formatInventory from '@/utils/format/formatInventory';
import getDealPayments, {
  getDealsWithPayments,
} from '@/utils/prisma/payment/getDealPayments';
import { DealsPayments } from '@/types/prisma/deals';
import collapsePayments from '@/utils/finance/collapsePayments';
import { concat } from 'lodash';
import { formsPath } from '@/lib/paths';
import fs from 'fs/promises';
import path from 'path';
import deleteFromBucket from '@/utils/minio/deleteFromBucket';
import financeFormat from '@/utils/finance/format';

const chunkSize = 3;

// const deleteExistingBillingFiles = async () => {
//   // delete all existing files in the output folder
//   return await fs.readdir(formsPath).then(async (files) => {
//     files = files.filter((file) => file.includes('billing'));
//     if (files.length > 0) return;
//     await Promise.all(
//       files.map((file) => {
//         const outputPath = path.join(formsPath, file);
//         return fs.unlink(path.join(outputPath, file));
//       }),
//     );
//   });
// };

async function generateBillingStatements() {
  const BusinessData = getBusinessData();
  let allStatements: string[][] = [];
  const processedDeals: string[] = [];

  const dealsToClose: string[] = [];

  const [deals] = await Promise.all([
    getDealsWithPayments({ state: 1 }),
    deleteFromBucket('billing'),
  ]);

  const chunkedDeals: DealsPayments[number][][] = [];
  for (let i = 0; i < deals.length; i += chunkSize) {
    const chunk = deals.slice(i, i + chunkSize);
    chunkedDeals.push(chunk);
  }

  for (const chunk of chunkedDeals) {
    let statement: string[] = [];
    for (const customer of await Promise.all(chunk)) {
      if (!customer) {
        throw new Error('Customer not found and could not be billed');
      }

      if (processedDeals.includes(customer.id)) {
        console.warn('Encountered duplicate.');
        continue;
      } else {
        processedDeals.push(customer.id);
      }

      let thisStatement = [];
      const customerName = fullNameFromPerson(customer.Account.person);

      const address = addressFromPerson({
        person: customer.Account.person,
      });

      const calculatedDelinquent = delinquent(customer);

      const monthsDelinquent = Math.floor(
        calculatedDelinquent.totalDelinquent / +(customer.pmt || 0),
      );

      if (Number.isNaN(monthsDelinquent)) {
        if (+(customer.pmt || 0) === 0 || +(customer.lien || 0) === 0) {
          dealsToClose.push(customer.id);
          continue;
        }
        throw new Error('Months delinquent is NaN');
      }

      const accountStatus = getCustomerStatus(monthsDelinquent);

      const dealDate = new Date(customer.date);
      const hasPaidThisMonth = calculatedDelinquent.paidThisMonth;

      let nextPayment: string | Date = '';

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
        nextPayment = datePlusMonths(
          new Date(customer.date),
          monthsSinceDeal + Math.abs(monthsDelinquent),
        );
      } else {
        nextPayment = datePlusMonths(new Date(customer.date), monthsSinceDeal);
      }

      nextPayment = new Date(nextPayment).toLocaleDateString();

      const history = financeHistory(customer);

      if (history.length > 0) {
        const lastHistory = history[history.length - 1];
        if (!lastHistory) {
          throw new Error('No history found');
        }

        if (lastHistory.balance === '0.00') {
          dealsToClose.push(customer.id);
          continue;
        }
      }

      // Jan 2023/nFeb 2023/nMar 2023
      const paymentMonths = history
        .map((h) =>
          new Date(h.date)
            .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            .toUpperCase(),
        )
        .join('\n');
      const paymentBeginBal = history.map((h) => h.balance).join('\n') + '\n';
      const paymentPayment = history.map((h) => h.paid).join('\n') + '\n';
      const paymentEndBal = history.map((h) => h.owed).join('\n') + '\n';

      if (
        !customer.pmt ||
        !customer.lien ||
        +customer.pmt <= 2 ||
        +history[history.length - 1]?.balance <= 5
      ) {
        dealsToClose.push(customer.id);
        continue;
      }

      thisStatement = [
        BusinessData.businessName,
        BusinessData.street,
        BusinessData.cityStateZip,
        customerName,
        address.street,
        address.cityStateZip,
        formatInventory(customer.inventory),
        `Account status: ${accountStatus}\n`,
        monthsDelinquent <= 0
          ? ''
          : monthsDelinquent === 1
          ? 'You are 1 month delinquent'
          : `Total delinquent balance of ${financeFormat({
              num: calculatedDelinquent.totalDelinquent,
            })} (${monthsDelinquent} months delinquent)`,
        `Next payment of ${financeFormat({
          num: customer.pmt,
        })} is due on ${nextPayment}`,
        BusinessData.businessName,
        BusinessData.businessMotto,
        BusinessData.phoneNumber,
        paymentMonths,
        paymentBeginBal,
        paymentPayment,
        paymentEndBal,
      ].map((d) =>
        typeof d === 'undefined' || d === null
          ? ' '
          : d
              .toString()
              .replaceAll(
                //   Regex to replace all quotes and commas with whitespace
                /["',]/g,
                '',
              )
              .toUpperCase(),
      );

      statement = statement.concat(thisStatement);
    }

    allStatements = concat(allStatements, [statement]);
  }

  const expectedStatements = Math.ceil(
    (deals.length - dealsToClose.length) / chunkSize,
  );
  if (
    allStatements.length > 0 &&
    Math.abs(allStatements.length - expectedStatements) > 3
  ) {
    throw new Error(
      `Expected ${expectedStatements} ( +- 3 ) statements, but got ${allStatements.length} instead.`,
    );
  }

  dealsToClose.length !== 0 && (await closeDeals({ deals: dealsToClose }));

  // const urls = [];
  //
  // for (const statement of allStatements) {
  //   urls.push await generate({
  //     form: 'billing',
  //     data: allStatements,
  //     output: 'billing',
  //     bucket: 'billing',
  //   });
  // }

  return await Promise.all(
    allStatements.map(async (statement, index) => {
      return generate({
        form: 'billing',
        data: statement,
        output: `billing_${index}`,
        bucket: 'billing',
      });
    }),
  );
}

export default generateBillingStatements;
