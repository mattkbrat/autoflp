import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';
import notifyPayment from '@/utils/pushover/payment';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';

const deletePayment = async ({ payment: payment_id }: { payment: string }) => {
  if (!payment_id) throw new Error('No payment id provided');
  const payment = await prisma.payment.delete({
    where: {
      id: payment_id,
    },
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
  });

  const { Account, inventory } = payment.deal_payment_dealTodeal;

  const { person } = Account;

  await notifyPayment({
    amount: +payment.amount,
    inventory,
    pid: person.id,
    type: 'DELETE',
    name: fullNameFromPerson({
      first_name: payment.deal_payment_dealTodeal.Account.person.first_name,
      last_name: payment.deal_payment_dealTodeal.Account.person.last_name,
    }),
  });

  return payment;
};

export default deletePayment;
