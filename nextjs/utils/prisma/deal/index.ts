import getDealsWithRelevant from '@/utils/prisma/deal/getDealsWithRelevant';
import getDeal from '@/utils/prisma/deal/getDeal';
import getCurrentDealsWithInventory from '@/utils/prisma/deal/getCurrentDealsWithInventory';
import createDealSalesman from '@/utils/prisma/deal/createDealSalesman';
import closeDeals from '@/utils/prisma/deal/closeDeals';
import createDeal from '@/utils/prisma/deal/createDeal';
import getDealsByAccount from '@/utils/prisma/deal/getDealsByAccount';
import getDeals from '@/utils/prisma/deal/getDeals';

export {
  getDealsWithRelevant,
  getDeal,
  getDeals,
  getDealsByAccount,
  closeDeals,
  createDeal,
  createDealSalesman,
  getCurrentDealsWithInventory,
};
