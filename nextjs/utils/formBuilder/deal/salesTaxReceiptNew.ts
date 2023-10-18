import {
  fullNameFromPerson,
  generateOutputFilename,
  getBusinessData,
  processArray,
} from '../functions';
import generate from '../generate';
import { Form } from '@/types/forms';
import { Deal, DealWithRelevant } from '@/types/prisma/deals';
import { datePlusMonths } from '@/utils/date';
import financeCalc from '@/utils/finance/calc';
import getDealById from '@/utils/prisma/deal/getDealById';
import formatDate from '@/utils/date/format';
import { addressFromPerson } from '@/utils/format/addressFromPerson';

const businessData = getBusinessData();
const formName: Form = 'Sales Tax Receipt New';

function salesTaxReceiptDataCompiler(deal: DealWithRelevant) {
  if (typeof deal === 'undefined') {
    return [];
  }

  if (deal === null || deal.Account === null) {
    throw `${formName} requires deal`;
  }

  // Prevent index out of bounds
  const trades: {
    year?: string;
    make?: string;
    model?: string;
    vin?: string;
    value?: string;
  }[] = [{}, {}, {}];

  deal.dealTrades.map((trade, n) => {
    trades[n] = {
      year: trade.inventory.year?.toString() ?? "",
      make: trade.inventory.make ?? "",
      model: trade.inventory.model ?? "",
      vin: trade.vin ?? "",
      value: trade.value ?? "0.00",
    };
  });

  const totalTradeValue = trades.reduce(
    (acc, trade) => acc + +(trade.value || 0),
    0,
  );

  const date = datePlusMonths(deal.date, 1);
  const customerFullName = fullNameFromPerson(deal.Account.person);

  const filingFees = deal.dealCharges.filter(
    (charge) => charge.charges?.name === 'Filing Fee',
  );
  const filingFeesSum = filingFees.reduce(
    (acc, charge) => acc + +(charge.charges?.amount || 0),
    0,
  );

  const customerAddress = addressFromPerson({
    person: deal.Account.person,
  });

  // const salesmen = deal.dealSalesmen
  //   .map((salesman) => fullNameFromPerson(salesman.Salesman.salesmanPerson))
  //   .join(', ');

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

  return processArray([
    businessData.businessName,
    businessData.address,
    businessData.dealerNumber,
    businessData.invoiceNumber,
    deal.cash,
    totalTradeValue,
    finance.sellingTradeDifferential,
    formatDate(deal.date, 'yyyy-MM-dd'),
    deal.inventory?.year,
    deal.inventory?.make,
    deal.inventory?.model,
    deal.inventory?.vin,
    trades[0].year || "",
    trades[0].make || "",
    trades[0].vin || "",
    trades[0].model || "",
    trades[1]?.year || "",
    trades[1].make,
    trades[1].vin || "",
    trades[1].model || "",
    customerFullName,
    customerAddress.full,
    businessData.salesTaxNumber,
    '', // Dealer City Sales Tax
    finance.sellingTradeDifferential,
    businessData.state,
    finance.stateTaxDollar.toFixed(2),
    '',
    '',
    (+(deal.tax_rtd || 0)).toFixed(2),
    finance.rtdTaxDollar.toFixed(2),
    '',
    '',
    (+(deal.tax_city || 0)).toFixed(2),
    finance.cityTaxDollar.toFixed(2),
    '',
    '',
    '',
    '',
    '',
    '',
    (+(deal.tax_county || 0)).toFixed(2),
    finance.countyTaxDollar.toFixed(2),
    '',
    '',
    '',
    '',
    '',
    '',
    finance.totalTaxDollar.toFixed(2),
  ]);
}

async function generateSalesTaxReceipt({
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
      fullDeal = await getDealById(dealId);
    }

    const appFormObj = salesTaxReceiptDataCompiler(fullDeal);

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

export default generateSalesTaxReceipt;
