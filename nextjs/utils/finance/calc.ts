// Amortized Loan Payment Formula:
// PMT = L[c(1 + c)^n]/[(1 + c)^n - 1]

import _ from 'lodash';
import formatDate from '@/utils/date/format';
import { datePlusMonths } from '@/utils/date';
import { FinanceCalcResult } from '@/types/Schedule';

// L = Loan Amount
// c = Monthly Interest Rate
// n = Number of Payments

function financeCalc({
  tax: { city, county, rtd, state },
  prices: { selling, down, trade },
  creditor: { filingFees, apr, term },
  firstPayment,
}: {
  tax: {
    city: number;
    county: number;
    rtd: number;
    state: number;
  };
  prices: {
    selling: number;
    down: number;
    trade: number;
  };
  creditor: {
    filingFees: number;
    apr: number;
    term: number;
  };
  firstPayment: Date;
}): FinanceCalcResult {
  let res: FinanceCalcResult = {
    sellingTradeDifferential: 0,
    stateTaxDollar: 0,
    countyTaxDollar: 0,
    cityTaxDollar: 0,
    rtdTaxDollar: 0,
    totalTaxDollar: 0,
    totalTaxPercent: 0,
    cashBalanceIncludingTax: 0,
    cashBalanceIncludingTaxWithDown: 0,
    unpaidCashBalance: 0,
    financeAmount: 0,
    totalLoanAmount: 0,
    deferredPayment: 0,
    monthlyPayment: 0,
    lastPayment: 0,
    deferred: 0,
    lastPaymentDueDate: '',
    firstPaymentDueDate: formatDate(firstPayment, 'yyyy-MM-dd'),
    totalCost: 0,
  };

  const cityTax = city / (city > 0 ? 100 : 1);
  const countyTax = county / (county > 0 ? 100 : 1);
  const rtdTax = rtd / (rtd > 0 ? 100 : 1);
  const stateTax = state / (state > 0 ? 100 : 1);

  const sellingTradeDifferential = selling - trade;

  const totalTaxPercent = _.sum([cityTax, countyTax, rtdTax, stateTax]) * 100;
  const totalTaxDollar = sellingTradeDifferential * (totalTaxPercent / 100);

  const unpaidCashBalance = sellingTradeDifferential - down + totalTaxDollar;

  const financeAmount = unpaidCashBalance + filingFees;

  const cashBalanceIncludingTax = unpaidCashBalance + totalTaxDollar;
  const cashBalanceIncludingTaxWithDown = cashBalanceIncludingTax + down;
  const deferred = cashBalanceIncludingTaxWithDown + filingFees;
  // If we wanted the down payment to be 0, the formula is
  // down = (selling - trade + fees) + (1 + totalTaxPercent)

  res = {
    ...res,
    sellingTradeDifferential,
    stateTaxDollar: stateTax * sellingTradeDifferential,
    countyTaxDollar: countyTax * sellingTradeDifferential,
    cityTaxDollar: cityTax * sellingTradeDifferential,
    rtdTaxDollar: rtdTax * sellingTradeDifferential,
    totalTaxDollar,
    totalTaxPercent,
    cashBalanceIncludingTax,
    cashBalanceIncludingTaxWithDown,
    unpaidCashBalance,
    financeAmount,
    deferred,
  };

  if (term <= 0) {
    return res;
  }

  // Calculate monthly payment
  const monthlyInterestRate = apr / 12 / 100;
  const monthlyPayment =
    (financeAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, term)) /
    (Math.pow(1 + monthlyInterestRate, term) - 1);

  // Calculate total loan amount
  const totalLoanAmount = monthlyPayment * term;

  // Calculate deferred payment (total loan interest)
  const deferredPayment = totalLoanAmount - financeAmount;

  // Calculate last payment
  const paymentRoundedToCents = Math.round(monthlyPayment * 100) / 100;
  // Find the difference in cents, and add it to the last payment
  // Payment rounded + lien - pmt rounded * term
  const lastPayment =
    paymentRoundedToCents + totalLoanAmount - paymentRoundedToCents * term;

  // Calculate last payment due date
  const lastPaymentDueDate = datePlusMonths(firstPayment, term);

  // Total Cost (price, interest, tax, fees)
  const totalCost = selling + totalTaxDollar + filingFees + deferredPayment;

  res = {
    ...res,
    totalLoanAmount,
    deferredPayment,
    monthlyPayment,
    lastPayment,
    lastPaymentDueDate: formatDate(lastPaymentDueDate, 'MM/dd/yyyy'),
    totalCost: totalCost,
  };

  return res;
}

export default financeCalc;
