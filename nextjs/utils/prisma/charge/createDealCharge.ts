import prisma from '@/lib/prisma';

import { randomUUID } from 'crypto';

const createDealCharge = ({
  deal,
  charge,
  note,
  date,
}: {
  deal: string;
  charge: string;
  note?: string;
  date: string;
}) => {
  // Check if the deal already has the charge,
  // if so, return the existing deal_charge
  // const existing = prisma.deal_charge.findMany({
  //   where: {
  //     deal,
  //     charge,
  //   },
  // });
  //
  // if (existing.length > 0) {
  //   return existing;
  // }
  //
  // const result = await prisma.deal_charge.create({
  //   data: {
  //     deal,
  //     charge,
  //     note,
  //     id: generateUUID(),
  //     date,
  //   },
  // });

  return prisma.dealCharge.upsert({
    where: {
      deal_charge: {
        deal,
        charge,
      },
    },
    update: {
      note,
      date,
    },
    create: {
      deal,
      charge,
      note,
      id: randomUUID(),
      date,
    },
  });
};

export default createDealCharge;
