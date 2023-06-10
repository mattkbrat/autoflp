import prisma from '@/lib/prisma';
import { AsyncReturnType } from '@/types/AsyncReturn';
export default async function getAll() {
  return prisma.account.findMany({});
}

export async function getAllWithRelevant() {
  return prisma.account.findMany({
    include: {
      person: true,
      deal_deal_accountToaccount: {
        include: {
          creditor_deal_creditorTocreditor: true,
          inventory_deal_inventoryToinventory: true,
          deal_salesman_deal_salesman_dealTodeal: true,
        },
      },
    },
  });
}

export type AccountsWithRelevant = AsyncReturnType<typeof getAllWithRelevant>;

export async function getOne(id: string) {
  return prisma.account.findUnique({
    where: {
      id,
    },
  });
}

export async function getOneWithRelevant(id: string) {
  return prisma.account.findUnique({
    where: {
      id,
    },
    include: {
      person: true,
      deal_deal_accountToaccount: {
        include: {
          creditor_deal_creditorTocreditor: true,
          inventory_deal_inventoryToinventory: true,
          deal_salesman_deal_salesman_dealTodeal: true,
        },
      },
    },
  });
}
