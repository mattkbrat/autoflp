import prisma from '@/lib/prisma';

import { Deal } from '@/types/prisma/deals';
import { Salesman } from '@/types/prisma/person';
import { randomUUID } from 'crypto';

const createDealSalesman = async ({
  deal,
  salesman,
}: {
  deal: Deal;
  salesman: Salesman['id'];
}) => {
  // const existing = await prisma.deal_salesman.findMany({
  //   where: {
  //     deal: deal.id,
  //     salesman: salesman,
  //   },
  // });
  //
  // if (existing.length > 0) {
  //   return existing;
  // }
  //
  // return prisma.deal_salesman.create({
  //   data: {
  //     deal: deal.id,
  //     salesman: salesman,
  //     id: randomUUID(),
  //   },
  // });

  return prisma.deal_salesman.upsert({
    where: {
      deal_id_salesman_id: {
        deal_id: deal.id,
        salesman_id: salesman,
      },
    },
    update: {},
    create: {
      deal_id: deal.id,
      salesman_id: salesman,
      id: randomUUID(),
    },
  });
};

export default createDealSalesman;
