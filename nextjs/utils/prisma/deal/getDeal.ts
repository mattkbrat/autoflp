import prisma from '@/lib/prisma';

const getDeal = async ({ id }: { id: string }) => {
  return prisma.deal.findUnique({
    where: {
      id,
    },
  });
};

export default getDeal;
