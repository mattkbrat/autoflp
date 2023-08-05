import { DealTrade } from '@prisma/client';
import prisma from '@/lib/prisma';
import { randomUUID } from 'crypto';

const createDealTrade = async ({
  deal,
  vin,
  value,
}: {
  deal: DealTrade['deal'];
  vin: DealTrade['vin'];
  value: number | string;
}) => {
  value = typeof value === 'number' ? value.toFixed(2) : value || '0';

  return prisma.dealTrade.upsert({
    where: {
      deal_vin: {
        deal: deal,
        vin,        
      }
    },
    update: {
      value,
    },
    create: {
      id: randomUUID(),
      deal: deal,
      vin,
      value,
    },
  });
};

export default createDealTrade;
