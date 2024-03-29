import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/utils/auth/withSession';
import { getInventoryWithDeals } from '@/utils/prisma/inventory';

const InventoryWithDealsHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  const { id } = req.query;

  const { user } = req.session;

  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Bad Request' });
  }

  const idIsVin = id.length === 17;

  return res.send(await getInventoryWithDeals(
    idIsVin ? { vin: id } :
    { inventoryId: id}
    
    ));
};

export default withSessionRoute(InventoryWithDealsHandler);
