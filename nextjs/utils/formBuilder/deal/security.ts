import {
  fullNameFromPerson,
  generateOutputFilename,
  getBusinessData,
  processArray,
} from '../functions';
import generate from '../generate';
import { Form } from '@/types/forms';
import { DealWithRelevant } from '@/types/prisma/deals';
import { datePlusMonths } from '@/utils/date';
import financeCalc from '@/utils/finance/calc';
import formatDate from '@/utils/date/format';
import getDealById from '@/utils/prisma/deal/getDealById';
import { addressFromPerson } from '@/utils/format/addressFromPerson';

const businessData = getBusinessData();
let formName: Form = 'Security';

function securityDataCompiler(deal: DealWithRelevant) {
  if (typeof deal === 'undefined') {
    return [];
  }

  if (deal === null || deal.Account === null) {
    throw `${formName} requires deal`;
  }

  const date = datePlusMonths(deal.date, 1);

  const trades = deal.dealTrades.map((trade) => {
    return {
      year: trade.inventory.year,
      make: trade.inventory.make,
      model: trade.inventory.model,
      vin: trade.vin,
      value: trade.value,
    };
  });
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

  if (deal.creditors?.business_name === businessData.businessName) {
    formName = 'Security-1';
  }

  const creditorAddress = addressFromPerson({
    person: deal.creditors?.person,
  });

  /**
     * {
                            Customer.Account.Id,
                            Logic.StrHash(Customer.Transaction.Id),
                            Customer.Transaction.Lien.ToString("0.00"),
                            Customer.Transaction.ContractDate.ToShortDateString(),
                            Customer.Transaction.DateMaturity.ToShortDateString(),
                            Customer.Account.Phone,
                            Customer.Account.FullName,
                            Customer.Transaction.Cosigner.FullName,
                            Customer.Account.Address,
                            Globals.BusinessData.Name,
                            "",
                            Globals.BusinessData.Address,
                            Customer.Transaction.Creditor.Apr.ToString("0.00"),
                            Customer.Transaction.Charges.ToString("0.00"),
                            Customer.Transaction.Finance.ToString("0.00"),
                            Customer.Transaction.Lien.ToString("0.00"),
                            Customer.Transaction.Down.ToString("0.00"),
                            Customer.Transaction.Lien.ToString("0.00"),
                            Customer.Transaction.Term.ToString("0"),
                            Customer.Transaction.Pmt.ToString("0.00"),
                            Customer.Transaction.Term != 0 ? "Monthly Starting" : "N/A",
                            Customer.Transaction.Term != 0 ? 
                                Customer.Transaction.ContractDate.AddMonths(1).ToShortDateString() : "",
                            Customer.Transaction.Creditor.Name,
                            Customer.Transaction.Creditor.Address,
                            (Customer.Transaction.TaxTotalDollar + Customer.Transaction.SellValue).ToString("0.00"),
                            Customer.Transaction.TaxTotalDollar.ToString("0.00"),
                            Customer.Transaction.Down.ToString("0.00"),
                            Customer.Transaction.TradeValue.ToString("0.00"),
                            (Customer.Transaction.Differential + Customer.Transaction.TaxTotalDollar -
                             Customer.Transaction.Down).ToString("0.00"),
                            Customer.Transaction.Creditor.FilingFees.ToString("0.00"),
                            Customer.Transaction.Creditor.FilingFees.ToString("0.00"),
                            "",
                            Customer.Transaction.Finance.ToString("0.00"),
                            Customer.Transaction.Selling.Year.ToString("0"),
                            Customer.Transaction.Selling.Make,
                            $"{Customer.Transaction.Selling.Model} {Customer.Transaction.Selling.Color}".Trim(),
                            Customer.Transaction.Selling.Vin,
                            Globals.BusinessData.Name,
                            Customer.Transaction.ContractDate.ToShortDateString(),
                            Globals.BusinessData.Name,
                        };
     */

  const regularPayment = finance.monthlyPayment.toFixed(2);
  const lastPayment = finance.lastPayment.toFixed(2);
  const term = deal.term || 0;

  return processArray([
    deal.Account.id.split('-')[0],
    deal.id.split('-')[0],
    (+(deal.lien || 0)).toFixed(2),
    formatDate(deal.date, 'MM/dd/yyyy'),
    finance.lastPaymentDueDate,
    deal.Account.person.phone_primary,
    fullNameFromPerson(deal.Account.person),
    deal.Account.cosigner ? deal.Account.cosigner : customerAddress.street,
    deal.Account.cosigner ? customerAddress.full : customerAddress.cityStateZip,
    businessData.businessName,
    '',
    businessData.address,
    (+(deal.apr || 0)).toFixed(2),
    filingFeesSum.toFixed(2),
    finance.financeAmount.toFixed(2),
    (+(deal.lien || 0)).toFixed(2),
    (+(deal.down || 0)).toFixed(2),
    finance.financeAmount.toFixed(2),
    regularPayment === lastPayment ? term : `${+term - 1} Months / 1 Month`,
    regularPayment === lastPayment
      ? regularPayment
      : `${regularPayment} / ${lastPayment}`,
    deal.term
      ? `$${regularPayment}: ${finance.firstPaymentDueDate} - ${datePlusMonths(
          finance.lastPaymentDueDate,
          -1,
          true,
        )}`
      : '',
    deal.term ? `$${lastPayment}: ${finance.lastPaymentDueDate}` : '',
    deal.creditors?.business_name,
    creditorAddress.full,
    (+(finance.totalTaxDollar || 0) + +(deal.cash || 0)).toFixed(2),
    (+(finance.totalTaxDollar || 0)).toFixed(2),
    (+(deal.down || 0)).toFixed(2),
    totalTradeValue.toFixed(2),
    (
      +(finance.totalTaxDollar || 0) +
      +(deal.cash || 0) -
      +(deal.down || 0) -
      totalTradeValue
    ).toFixed(2),
    filingFeesSum.toFixed(2),
    filingFeesSum.toFixed(2),
    '',
    finance.financeAmount.toFixed(2),
    deal.inventory.year,
    deal.inventory.make,
    `${deal.inventory.model} ${deal.inventory.color ?? ''}`.trim(),
    deal.inventory.vin,
    businessData.businessName,
    formatDate(deal.date, 'MM/dd/yyyy'),
    businessData.businessName,
  ]);
}

async function generateSecurity({
  dealId,
  fullDeal,
  output,
}: {
  dealId?: DealWithRelevant['id'];
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

    const appFormObj = securityDataCompiler(fullDeal);

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

export default generateSecurity;
