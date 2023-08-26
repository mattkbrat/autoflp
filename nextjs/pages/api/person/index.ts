import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/utils/auth/withSession';
import { getInventoryWithDeals } from '@/utils/prisma/inventory';
import getPerson from '@/utils/prisma/person/getPerson';
import getPeople from '@/utils/prisma/person/getPeople';

const PersonHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { id } = req.query;

  const { user } = req.session;

  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  if (typeof id !== 'string') {
    return res.send(await getPeople());
  }

  return res.send(await getPerson({ id: id }));
};

export default withSessionRoute(PersonHandler);
