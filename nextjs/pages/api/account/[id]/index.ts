import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/utils/auth/withSession';
import { getInventoryWithDeals } from '@/utils/prisma/inventory';
import getPerson from '@/utils/prisma/person/getPerson';
import getPeople from '@/utils/prisma/person/getPeople';
import { getAccount, getAccounts } from '@/utils/prisma/account';

const AccountHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  const { user } = req.session;

  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  if (typeof id !== 'string') {
    return res.send(await getAccounts({ withPerson: false }));
  }

  return res.send(await getAccount({ id: id }));
};

export default withSessionRoute(AccountHandler);
