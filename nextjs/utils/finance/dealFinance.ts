import { DealWithRelevant } from '@/types/prisma/deals';
import financeCalc from '@/utils/finance/calc';
import { datePlusMonths } from '@/utils/date';

export const dealFinance = (deal: DealWithRelevant) => {
  return financeCalc({
    tax: {
      city: Number(deal.tax_city || 0),
      state: Number(deal.tax_state || 0),
      county: Number(deal.tax_county || 0),
      rtd: Number(deal.tax_rtd || 0),
    },
    prices: {
      trade: deal.dealTrades.reduce((acc, curr) => acc + Number(curr.value), 0),
      selling: Number(deal.cash || 0),
      down: Number(deal.down || 0),
    },
    creditor: {
      filingFees: Number(deal.creditors?.filing_fees || 0),
      apr: Number(deal.creditors?.apr || 0),
      term: Number(deal.term || 0),
    },
    firstPayment: new Date(datePlusMonths(deal.date, 1)),
  });
};
