import {
  FinanceCalcResult,
  FinanceHistory,
  ParsedAmortizationSchedule,
  ScheduleRow,
} from '@/types/Schedule';
import { amortizationSchedule, delinquent, financeHistory } from '@/utils/finance';
import financeCalc from '@/utils/finance/calc';
import { getBusinessData } from '@/utils/formBuilder/functions';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import { getDealPayments } from '@/utils/prisma/payment';
import { NextApiRequest, NextApiResponse } from 'next';

type scheduleType = ScheduleRow[];

async function fetchCustomerAmortizationSchedule(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  console.log(req.body, req.query);

  let scheduleFetchParams: {
    history?: FinanceHistory;
    principal: number;
    annualRate: number;
    numberOfPayments: number;
    finance?: FinanceCalcResult;
    pmt: number;
  } = {
    history: undefined,
    principal: 0,
    annualRate: 0,
    numberOfPayments: 0,
    pmt: 0,
  };

  let dealParams: {
    fullName?: string;
    inventoryString?: string;
    delinquentBalance?: number;
  } = {
    fullName: undefined,
    inventoryString: undefined,
    delinquentBalance: undefined,
  };

  let calculatedFinance;

  if (typeof id === 'string') {
    const fetchedPayments = await getDealPayments({ deal: id as string });

    if (!fetchedPayments) {
      return res.status(404).json({ error: 'No payments found' });
    }

    calculatedFinance = financeCalc({
      tax: {
        city: +(fetchedPayments.tax_city || 0),
        state: +(fetchedPayments.tax_state || 0),
        county: +(fetchedPayments.tax_county || 0),
        rtd: +(fetchedPayments.tax_rtd || 0),
      },
      prices: {
        selling: +(fetchedPayments.cash || 0),
        trade: +(fetchedPayments.dealTrades.reduce((a, b) => a + +b.value, 0) || 0),
        down: +(fetchedPayments.down || 0),
      },
      creditor: {
        filingFees: +(
          fetchedPayments.dealCharges
            .filter((a) => a.charges?.name === 'Filing Fees')
            .reduce((a, b) => a + +(b.charges?.amount || 0), 0) || 0
        ),
        apr: +fetchedPayments.apr,
        term: +fetchedPayments.term,
      },
      firstPayment: new Date(fetchedPayments.date),
    });

    const i = fetchedPayments.inventory;

    dealParams = {
      fullName: fullNameFromPerson(fetchedPayments.Account.person),
      inventoryString: `${i.year.substring(2, 4)} ${i.make} ${i.model}`,
      delinquentBalance: delinquent(fetchedPayments).totalDelinquent,
    };

    scheduleFetchParams = {
      history: financeHistory(fetchedPayments),
      principal: +(fetchedPayments.finance || 0),
      annualRate: +(fetchedPayments.apr || 0),
      numberOfPayments: +(fetchedPayments.term || 0),
      pmt: +(fetchedPayments.pmt || 0),
    };
  } else if (req.body.principal) {
    scheduleFetchParams = {
      history: undefined,
      principal: +(req.body.principal || 0),
      annualRate: +(req.body.annualRate || 0),
      numberOfPayments: +(req.body.numberOfPayments || 0),
      pmt: +(req.body.pmt || 0),
    };
  } else {
    res.status(400).json({ error: 'No id or body provided' });
    return;
  }

  const finance: FinanceCalcResult | undefined =
    req.body.finance || calculatedFinance;

  if (typeof finance === 'undefined') {
    return res.status(400).json({ error: 'No finance provided' });
  }

  const schedule = amortizationSchedule({ ...scheduleFetchParams, finance });

  schedule.schedule.reverse();

  const { paymentsBeforeStart } = schedule;

  if (schedule.schedule.length === 0) {
    res.status(404).json({ error: 'No schedule found' });
    return;
  }

  schedule.schedule[0].payment = [
    ...paymentsBeforeStart,
    ...schedule.schedule[0].payment,
  ];

  // Break the schedule into equal parts of 12
  const scheduleParts: scheduleType[] = schedule?.schedule?.reduce(
    (acc: ScheduleRow[], curr: ScheduleRow, index: number) => {
      const chunkIndex = Math.floor(index / 12);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(curr);
      return acc;
    },
    [],
  );

  const nextPaymentDate = new Date(
    (schedule.startDate || new Date()).getFullYear(),
    (schedule.startDate || new Date()).getMonth() + 1,
    schedule.startDate?.getDate(),
  );
  const businessInfo = getBusinessData();

  const result: ParsedAmortizationSchedule = {
    schedule: scheduleParts,
    pmt: schedule.pmt,
    principal: schedule.principal || 0,
    hasHistory: scheduleFetchParams.history !== undefined,
    startDate: new Date(
      schedule.startDate ||
        new Date().setMonth(new Date().getMonth() - schedule.schedule.length),
    ),
    endDate: new Date(
      schedule.endDate ||
        new Date().setMonth(new Date().getMonth() + schedule.schedule.length),
    ),
    nextPaymentDate,
    totalPaid: schedule.totalPaid,
    paidToday: schedule.schedule[0].payment.reduce((acc, curr) => acc + curr, 0),
    business: businessInfo,
    ...dealParams,
  };

  return res.status(200).json(result);
}

export default fetchCustomerAmortizationSchedule;
