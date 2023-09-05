import { NextApiRequest, NextApiResponse } from 'next';
import { Payment } from '@/types/prisma/payments';
import { DealsPayments } from '@/types/prisma/deals';
import { addressFromPerson } from '@/utils/format/addressFromPerson';
import { delinquent } from '@/utils/finance/index';
import generateBillingStatements from '@/utils/formBuilder/billing';
import { getDealsWithPayments } from '@/utils/prisma/payment/getDealPayments';

export type DelinquentAccount = {
  account?: {
    person: {
      id: string;
      first_name: string;
      last_name: string;
      address: string;
      phone: string;
    };
  };
  vehicle?: {
    display: string;
    id: string;
  };
  delinquent: string;
  id: string;
};

function formatDelinquent(
  deal: DealsPayments[number],
  delinquent: number,
): DelinquentAccount {
  return {
    account: {
      person: {
        id: deal.Account.person.id,
        first_name: deal.Account.person.first_name,
        last_name: deal.Account.person.last_name,
        address: addressFromPerson({ person: deal.Account.person }).full,
        phone: deal.Account.person.phone_primary,
      },
    },
    vehicle: {
      display:
        deal.inventory.make + ' ' + deal.inventory.model + ' ' + deal.inventory.year,
      id: deal.inventory.id,
    },
    delinquent: delinquent.toFixed(2),
    id: deal.id,
  };
}

export async function getBilling(): Promise<BillingHandlerType> {
  const billableAccounts = await getDealsWithPayments({ state: 1 });

  const accountsInDefault = [];

  let totalDelinquent = 0;
  let totalAmountExpected = 0;
  let expectedThisMonth = 0;
  let paidThisMonth = 0;

  let greatestDelinquent: DelinquentAccount = {
    account: undefined,
    vehicle: undefined,
    delinquent: '0.00',
    id: '',
  };

  for (const account of billableAccounts) {
    const {
      totalDelinquent: thisDelinquent,
      totalExpectedAtDate,
      paidThisMonth: accPaid,
    } = delinquent(account);

    const monthlyPayment = account.pmt;

    if (thisDelinquent > +(greatestDelinquent?.delinquent || 0)) {
      greatestDelinquent = formatDelinquent(account, thisDelinquent);
    }

    totalDelinquent += thisDelinquent;
    totalAmountExpected += totalExpectedAtDate;
    expectedThisMonth += +(monthlyPayment || 0);
    paidThisMonth += accPaid;

    if (+(monthlyPayment || 0) * 2 < thisDelinquent) {
      accountsInDefault.push(formatDelinquent(account, thisDelinquent));
    }
  }

  const sortedDefaults = accountsInDefault.sort((a, b) => {
    if (+a.delinquent > +b.delinquent) {
      return -1;
    } else if (+a.delinquent < +b.delinquent) {
      return 1;
    } else {
      return 0;
    }
  });

  return {
    totalDelinquent,
    greatestDelinquent,
    accountsInDefault: sortedDefaults,
    totalAmountExpected,
    expectedThisMonth,
    paidThisMonth,
    totalOpenAccounts: billableAccounts.length,
  };
}

export type BillingHandlerType = {
  totalDelinquent: number;
  totalAmountExpected: number;
  expectedThisMonth: number;
  paidThisMonth: number;
  greatestDelinquent: DelinquentAccount;
  accountsInDefault: DelinquentAccount[];
  totalOpenAccounts: number;
};
