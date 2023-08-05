import prisma from '@/lib/prisma';
import { Deal } from '@/types/prisma/deals';
import { randomUUID } from 'crypto';
const createPayment = ({
  deal_id,
  amount,
  date,
}: {
  deal_id: Deal['id'];
  amount: string | number;
  date: string;
}) => {
  amount = typeof amount === 'number' ? amount.toFixed(2) : amount || '0';
  return prisma.payment.create({
    data: {
      id: randomUUID(),
      date,
      amount,
      deal: deal_id,
    },
  });
};

export default createPayment;
