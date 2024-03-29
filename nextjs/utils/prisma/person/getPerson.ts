import prisma from '@/lib/prisma';
import id from '@/pages/api/deal/[id]';

const getPerson = (args: { id: string }) => {
  return prisma.person.findUnique({
    where: {
      id: args.id,
    },
  });
};

export default getPerson;
