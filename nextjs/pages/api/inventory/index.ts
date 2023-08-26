import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/utils/auth/withSession';
import { getInventory } from '@/utils/prisma/inventory';

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

  const { make, model, year, vin, state, deal } = req.query;

  if (typeof state !== 'undefined' && typeof state !== 'string') {
    return res.status(400).json({ message: 'Bad Request' });
  }

  if (typeof deal !== 'undefined' && typeof deal !== 'string') {
    return res.status(400).json({ message: 'Bad Request' });
  }

  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  return res.send(
    await getInventory({
      make,
      model,
      year,
      vin,
      state: state ? +state : undefined,
      deal,
    }),
  );
};

export default withSessionRoute(InventoryHandler);
