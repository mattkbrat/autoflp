import prisma from '@/lib/prisma';

const getPayments = async () => {
  return prisma.payment.findMany();
};

export default getPayments;
