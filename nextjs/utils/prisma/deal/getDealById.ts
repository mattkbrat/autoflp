import { getDealsWithRelevant } from '@/utils/prisma/deal';

const getDealById = async (id: string) => {
  return getDealsWithRelevant({ id: id }).then((deals) => {
    return deals[0];
  });
};

export default getDealById;
