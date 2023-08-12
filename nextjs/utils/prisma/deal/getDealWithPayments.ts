import prisma from '@/lib/prisma';

const getDealWithPayments = ({ deal }: { deal: string }) => {
  return prisma.deal.findUnique({
    where: {
      id: deal,
    },
    include: {
      payments: true,
    },
  });
};

export default getDealWithPayments;
