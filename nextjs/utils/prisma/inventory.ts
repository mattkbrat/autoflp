import prisma from "@/lib/prisma";

import { deal, deal_trade, inventory } from '@prisma/client';
import { AsyncReturnType } from "@/types/AsyncReturn";
import notifyInventory from "@/utils/pushover/inventory";
import formatInventory from "@/utils/format/formatInventory";
import { randomUUID } from "crypto";

const basicInventorySelect = {
  id: true,
  vin: true,
  make: true,
  model: true,
  year: true,
  color: true,
};

export async function fetchInventory(active: number | undefined) {
  let fetched;
  if (active !== undefined) {
    fetched = await prisma.inventory.findMany({
      where: {
        state: active,
      },
      orderBy: [
        {
          make: 'desc',
        },
        {
          model: 'desc',
        },
        {
          year: 'desc',
        },
      ],
    });
  } else {
    fetched = await prisma.inventory.findMany({
      orderBy: [
        {
          make: 'desc',
        },
        {
          model: 'desc',
        },
        {
          year: 'desc',
        },
      ],
    });
  }

  return fetched;
}

export type Inventory = AsyncReturnType<typeof fetchInventory>;

export async function fetchInventoryById(id: string) {
  return await prisma.inventory.findUnique({
    where: {
      id,
    },
  });
}

export async function fetchInventoryByDealId(id: string) {
  return await prisma.deal.findUnique({
    where: {
      id,
    },
    select: {
      inventory_deal_inventoryToinventory: true,
    },
  });
}

export type DealWithInventory = AsyncReturnType<typeof fetchInventoryByDealId>;

export async function fetchInventoryByVin(vin: string) {
  return await prisma.inventory.findMany({
    where: {
      vin,
    },
  });
}

export async function fetchInventoryByMake(make: string) {
  return await prisma.inventory.findMany({
    where: {
      make,
    },
  });
}

export async function fetchInventoryByModel(model: string) {
  return await prisma.inventory.findMany({
    where: {
      model,
    },
  });
}

export async function postInventory(inventory: inventory) {
  const id = randomUUID();

  return  await prisma.inventory.upsert({
    where: {
      vin: inventory.vin,
    },
    update: {
      ...inventory,
    },
    create: {
      ...inventory,
      id,
    },
  }).then(async (res) => {
    await notifyInventory({
      inventory: formatInventory(res),
      id: res.id,
      type: res.id === id ? 'CREATE' : 'UPDATE',
    });
    return res
  });
}

export async function closeInventory(id: inventory['id']) {
  return await prisma.inventory.update({
    where: {
      id,
    },
    data: {
      state: 0,
    },
  }).then(async (res) => {
    await notifyInventory({
      inventory: formatInventory(res),
      id: res.id,
      type: 'DELETE',
    });
    return res
  });
}

async function createDealTrade({
  deal,
  vin,
  value,
}: {
  deal: deal_trade['deal'];
  vin: deal_trade['vin'];
  value: number | string;
}) {
  const existing = await prisma.deal_trade.findFirst({
    where: {
      deal,
      vin,
    },
  });

  if (existing) {
    return existing;
  }

  return await prisma.deal_trade.create({
    data: {
      id: randomUUID(),
      deal,
      vin,
      value: typeof value === 'number' ? value.toFixed(2) : value,
    },
  });
}

export type DealTrade = AsyncReturnType<typeof createDealTrade>;

async function deleteInventoryByVin(vin: string) {
  return await prisma.inventory.delete({
    where: {
      vin,
    },
  }).then(async (res) => {
    await notifyInventory({
      inventory: formatInventory(res),
      id: res.id,
      type: 'DELETE',
    });
    return res
  });
}