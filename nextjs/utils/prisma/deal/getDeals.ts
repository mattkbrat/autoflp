import prisma from '@/lib/prisma';

const getDeals = ({ state }: { state?: 0 | 1 }) => {
  return prisma.deal.findMany({
    where: {
      state: state,
    },
  });
};

export default getDeals;
