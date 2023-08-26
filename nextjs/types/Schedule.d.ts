import { amortizationSchedule } from '@/utils/finance';
import financeHistory from '@/utils/finance/history';
import { BusinessData } from '@/types/BusinessData';
import { ScheduleType } from '@/pages/api/schedule';

export type ScheduleRow = {
  date: Date;
  payment: number[];
  total?: number;
  principal?: number;
  interest?: number;
  balance?: number;
  beginningBalance?: number;
  i: number;
  expected: number;
};

export type AmortizationScheduleReturn = ReturnType<typeof amortizationSchedule>;

export type AmortizationSchedule = typeof amortizationSchedule;

export type FinanceHistoryType = typeof financeHistory;
export type FinanceHistory = ReturnType<typeof financeHistory>;

export type FinanceCalcResult = {
  sellingTradeDifferential: number;
  stateTaxDollar: number;
  countyTaxDollar: number;
  cityTaxDollar: number;
  rtdTaxDollar: number;
  totalTaxDollar: number;
  totalTaxPercent: number;
  cashBalanceIncludingTax: number;
  cashBalanceIncludingTaxWithDown: number;
  unpaidCashBalance: number;
  financeAmount: number;
  totalLoanAmount: number;
  deferredPayment: number;
  monthlyPayment: number;
  lastPayment: number;
  lastPaymentDueDate: string;
  firstPaymentDueDate: string;
  deferred: number;
  totalCost: number;
};

export type FinanceCalcResultKeys = (keyof FinanceCalcResult)[];

export type FinanceCalcKeys = keyof FinanceCalcResult;

export type ParsedAmortizationSchedule = {
  schedule: ScheduleType[];
  pmt: number;
  principal: number;
  hasHistory: boolean;
  totalPaid: number;
  startDate: Date;
  endDate: Date;
  nextPaymentDate?: Date;
  inventoryString?: string;
  delinquentBalance?: number;
  fullName?: string;
  paidToday?: number;
  business: BusinessData;
};
