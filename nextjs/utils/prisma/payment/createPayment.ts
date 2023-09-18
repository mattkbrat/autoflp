import prisma from '@/lib/prisma';
import { Deal } from '@/types/prisma/deals';
import { randomUUID } from 'crypto';
import notifyPayment from '@/utils/pushover/payment';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
const createPayment = async ({
  deal_id,
  amount,
  date,
}: {
  deal_id: Deal['id'];
  amount: string | number;
  date: string;
}) => {
  amount = typeof amount === 'number' ? amount.toFixed(2) : amount || '0';

  const payment = await prisma.payment.create({
    include: {
      deal_payment_dealTodeal: {
        select: {
          inventory: {
            select: {
              make: true,
              model: true,
              year: true,
            },
          },
          Account: {
            select: {
              person: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                },
              },
            },
          },
        },
      },
    },
    data: {
      id: randomUUID(),
      date,
      amount,
      deal: deal_id,
    },
  });

  const { Account, inventory } = payment.deal_payment_dealTodeal;

  const { person } = Account;

  await notifyPayment({
    amount: +payment.amount,
    pid: person.id,
    type: 'POST',
    inventory,
    name: fullNameFromPerson({
      first_name: payment.deal_payment_dealTodeal.Account.person.first_name,
      last_name: payment.deal_payment_dealTodeal.Account.person.last_name,
    }),
  });

  return payment;
};

export default createPayment;
