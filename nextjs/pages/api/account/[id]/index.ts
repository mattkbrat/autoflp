import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/utils/auth/withSession';
import { getAccount, getAccounts } from '@/utils/prisma/account';
import { HTTP_METHOD } from 'next/dist/server/web/http';
import updateAccount from '@/utils/prisma/account/updateAccount';

const AccountHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  const { user } = req.session;

  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  if (typeof id !== 'string') {
    return res.send(await getAccounts({ withPerson: false }));
  }

  const method = req.method;

  try {
    switch (req.method as HTTP_METHOD) {
      case 'GET':
        return res.send(await getAccount({ id: id }));
      case 'HEAD':
        break;
      case 'OPTIONS':
        break;
      case 'POST':
        break;
      case 'PUT':
        return res.send(await updateAccount({ id, account: req.body }));
        break;
      case 'DELETE':
        break;
      case 'PATCH':
        break;
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error(error);
    return res
      .status(500)
      .json({ error: error?.message ?? 'Internal server error' });
  }
};

export default withSessionRoute(AccountHandler);
