import prisma from '@/lib/prisma';
import { Creditor } from '@prisma/client';


const deleteCreditor = ({ creditor: id }: { creditor: Creditor['id'] }) => {
  return prisma.creditor.delete({
    where: {
      id: id,
    },
  });
};
