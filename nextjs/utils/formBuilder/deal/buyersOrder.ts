import { randomInt } from 'crypto';

import {
  addressFromPerson,
  fullNameFromPerson,
  generateOutputFilename,
  getBusinessData,
  processArray,
} from '../functions';
import { datePlusMonths } from '@/utils/date';
import { Form } from '@/types/forms';
import { Deal, DealWithRelevant } from '@/types/prisma/deals';
import financeCalc from '@/utils/finance/calc';
import formatDate from '@/utils/date/format';
import { getDealsWithRelevant } from '@/utils/prisma/deal';
import { generate } from '@/utils/formBuilder';

const businessData = getBusinessData();
const formName: Form = 'Buyers Order';

function buyersOrderDataCompiler(deal: DealWithRelevant) {
  if (typeof deal === 'undefined' || deal === null) {
    return [];
  }

  const date = datePlusMonths(deal.date, 1);
  const customerFullName = fullNameFromPerson(deal.Account.person);

  const trades = deal.dealTrades.map((trade) => {
    return {
      year: trade.inventory.year,
      make: trade.inventory.make,
      model: trade.inventory.model,
      vin: trade.vin,
      value: trade.value,
    };
  });

  const tradeYears = trades
    .map((trade) => +trade.year.toString().slice(-2))
    .join(', ');
  const tradeMakes = trades.map((trade) => trade.make).join(', ');
  const tradeVins = trades.map((trade) => trade.vin.slice(-6)).join(', ');

  const totalTradeValue = trades.reduce(
    (acc, trade) => acc + +(trade.value || 0),
    0,
  );

  const filingFees = deal.dealCharges.filter(
    (charge) => charge.charges?.name === 'Filing Fee',
  );

  const filingFeesSum = filingFees.reduce(
    (acc, charge) => acc + +(charge.charges?.amount || 0),
    0,
  );

  const finance = financeCalc({
    tax: {
      state: +(deal.tax_state || 0),
      city: +(deal.tax_city || 0),
      rtd: +(deal.tax_rtd || 0),
      county: +(deal.tax_county || 0),
    },
    prices: {
      selling: +(deal.cash || 0),
      trade: totalTradeValue,
      down: +(deal.down || 0),
    },
    creditor: {
      apr: +(deal.apr || 0),
      filingFees: filingFeesSum,
      term: +(deal.term || 0),
    },
    firstPayment: new Date(date),
  });

  const customerAddress = addressFromPerson({
    person: deal.Account.person,
  });

  const salesmen = deal.dealSalesmen
    .map((salesman) => fullNameFromPerson(salesman.Salesman.salesmanPerson))
    .join(', ');

  if (typeof finance === 'undefined') {
    throw 'Finance is undefined';
  }

  return processArray([
    businessData.businessName, // Business Name
    deal.date, // Date
    businessData.street, // Street
    businessData.city, // City
    businessData.state, // State
    businessData.zip, // Zip
    salesmen, // Salesman
    'Space 1', // Extra Space
    'Space 2', // Extra Space
    randomInt(100000, 999999).toString(), // Contract Number // TODO: Make this a real contract number
    deal.inventory.color, // Color
    deal.inventory.make, // Make
    +deal.inventory.year, // Year
    // , deal.inventory.model // Model
    deal.inventory.vin, // VIN
    customerFullName, // Customer Name
    deal.Account.license_number, // DL
    '', // Delivery Date
    '', // Delivery Pay
    deal.inventory.mileage, // Mileage
    '', // Handling Fee
    (+deal.cash).toFixed(2), // Selling Price
    tradeYears,
    tradeMakes,
    tradeVins,
    totalTradeValue.toFixed(2),
    finance.sellingTradeDifferential.toFixed(2),
    finance.stateTaxDollar.toFixed(2),
    finance.cityTaxDollar.toFixed(2),
    finance.rtdTaxDollar.toFixed(2),
    finance.totalTaxDollar.toFixed(2),
    (finance.sellingTradeDifferential + finance.totalTaxDollar).toFixed(2),
    (+(deal.down || 0)).toFixed(2),
    '',
    (+(deal.down || 0)).toFixed(2),
    (
      finance.sellingTradeDifferential +
      finance.totalTaxDollar -
      +(deal.down || 0)
    ).toFixed(2),
    '0.00',
    '0.00',
    filingFeesSum.toFixed(2),
    '0.00', // Insurance Types
    filingFeesSum.toFixed(2),
    (+(deal.finance || 0 - finance.totalTaxDollar))?.toFixed(2),
    (+(deal.lien || 0) - +(deal.finance || 0))?.toFixed(2), // Finance Charges
    (+(deal.lien || 0))?.toFixed(2),
    finance.deferred.toFixed(2),
    (+(deal.creditors?.apr || 0)).toFixed(2),
    (+(deal.term || 0)).toFixed(0),
    (+finance.monthlyPayment).toFixed(2),
    formatDate(finance.firstPaymentDueDate, 'b yy'),
    (+finance.lastPayment).toFixed(2),
    finance.lastPaymentDueDate,
    businessData.primaryDealerName || '', // Dealer Name
    customerAddress.street,
    deal.Account.person.phone_primary,
    customerAddress.city,
    ['fort morgan', 'brush'].includes(customerAddress.city.toLowerCase())
      ? 'MORGAN'
      : '', // County // TODO Add county to person address
    customerAddress.state,
    customerAddress.zip,
  ]);
}

async function generateBuyersOrder({
  dealId,
  fullDeal,
  output,
}: {
  dealId?: Deal['id'];
  fullDeal?: DealWithRelevant;
  output?: string;
}) {
  try {
    if (typeof fullDeal === 'undefined') {
      if (typeof dealId === 'undefined') {
        throw new Error('Must provide either "dealId" or "fullDeal"');
      }
      fullDeal = await getDealsWithRelevant({ id: dealId }).then(
        (deals) => deals[0],
      );
      if (typeof fullDeal === 'undefined') {
        throw new Error(`Could not find deal with id ${dealId}`);
      }
    }

    const appFormObj = buyersOrderDataCompiler(fullDeal);

    if (!output) {
      const generatedOutput = generateOutputFilename({
        deal: fullDeal,
        form: formName,
        person: fullDeal?.Account?.person,
      });

      if (Array.isArray(generatedOutput)) {
        output = generatedOutput[0];
      } else {
        output = generatedOutput;
      }
    }

    return generate({
      form: formName,
      data: appFormObj,
      output,
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default generateBuyersOrder;
