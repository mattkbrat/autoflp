import { NextApiRequest, NextApiResponse } from 'next';
import { HTTP_METHOD } from 'next/dist/server/web/http';
import { getDealPayments } from '@/utils/prisma/payment';
import { withSessionRoute } from '@/utils/auth/withSession';

const dealPaymentsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { deal } = req.query;

  const user = req.session.user;

  if (!user) {
    return res.status(401).send('Unauthorized');
  }

  if (typeof deal !== 'string') {
    return res.status(400).send('Invalid deal id');
  }

  const method = req.method as HTTP_METHOD;

  switch (method) {
    case 'GET':
      return res.send(getDealPayments({ deal }));
    case 'HEAD':
      break;
    case 'OPTIONS':
      break;
    case 'POST':
      break;
    case 'PUT':
      break;
    case 'DELETE':
      break;
    case 'PATCH':
      break;
  }
};

export default withSessionRoute(dealPaymentsHandler);
