import prisma from '@/lib/prisma';

const deletePayment = ({ payment: payment_id }: { payment: string }) => {
  if (!payment_id) throw new Error('No payment id provided');
  return prisma.payment.delete({
    where: {
      id: payment_id,
    },
  });
};

export default deletePayment;
