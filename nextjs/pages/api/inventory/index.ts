import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/utils/auth/withSession';
import { createInventory, getInventory } from '@/utils/prisma/inventory';
import { HTTP_METHOD } from 'next/dist/server/web/http';

const InventoryHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { user } = req.session;

  /*
   make?: string | undefined;
    model?: string | undefined;
    year?: string | undefined;
    vin?: string | undefined;
    state?: number | undefined;
    deal?: string | undefined;
*/

  const { id, make, model, year, vin, state, deal } = req.query;

  if (typeof state !== 'undefined' && typeof state !== 'string') {
    return res.status(400).json({ message: 'Bad Request' });
  }

  if (typeof deal !== 'undefined' && typeof deal !== 'string') {
    return res.status(400).json({ message: 'Bad Request' });
  }

  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const method = req.method as HTTP_METHOD;

  switch (method) {
    case 'GET':
      return res.send(
        await getInventory({
          id,
          make,
          model,
          year,
          vin,
          state: typeof state !== 'undefined' ? Number(state) : undefined,
          deal,
        }),
      );
    case 'HEAD':
      break;
    case 'OPTIONS':
      break;
    case 'POST':
      return res.send(await createInventory({ inventory: req.body }));
    case 'PUT':
      break;
    case 'DELETE':
      break;
    case 'PATCH':
      break;
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
};

export default withSessionRoute(InventoryHandler);
