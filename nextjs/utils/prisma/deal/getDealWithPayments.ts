import getDealsWithRelevant from './getDealsWithRelevant';

const getDealWithPayments = async ({ deal }: { deal: string }) => {
  return getDealsWithRelevant({ id: deal }).then((deals) => {
    return deals[0];
  });
};

export default getDealWithPayments;
