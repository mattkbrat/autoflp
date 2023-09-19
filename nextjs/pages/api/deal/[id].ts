import { HTTP_METHOD } from 'next/dist/server/web/http';
import { NextApiRequest, NextApiResponse } from 'next';
import getAccountWithRelevantWithPayments from '@/utils/prisma/account/getAccountWithRelevantWithPayments';
import { withSessionRoute } from '@/utils/auth/withSession';
import { closeDeals } from '@/utils/prisma/deal';
import updateDeal from '@/utils/prisma/deal/updateDeal';

const individualDealHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = req.session.user;

  if (!user) {
    return res.status(401).send('Unauthorized');
  }

  const method = req.method as HTTP_METHOD;

  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).send('Invalid deal id');
  }

  switch (method) {
    case 'GET':
      return res.send(await getAccountWithRelevantWithPayments({ deal: id }));
    case 'HEAD':
      break;
    case 'OPTIONS':
      break;
    case 'POST':
      break;
    case 'PUT':
      return res.send(await updateDeal({ id, data: req.body }));

    case 'DELETE':
      return res.send(await closeDeals({ deals: [id] }));
    case 'PATCH':
      break;
  }

  res.setHeader('Allow', ['GET', 'HEAD', 'OPTIONS']);

  return res.status(405).send('Method not allowed');
};

export default withSessionRoute(individualDealHandler);
