import { withSessionRoute } from '@/utils/auth/withSession';
import { HTTP_METHOD } from 'next/dist/server/web/http';
import {
  closeInventory,
  createInventory,
  getInventoryById,
} from '@/utils/prisma/inventory';
import { NextApiRequest, NextApiResponse } from 'next';
import updateInventory from '@/utils/prisma/inventory/updateInventory';

const InventoryByIdHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { user } = req.session;

  const { id } = req.query;

  const idIsVin = typeof id === 'string' && id.length === 17;

  console.log(idIsVin, id);

  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  if (typeof id !== 'string')
    return res.status(400).json({ message: 'Bad Request' });

  const method = req.method as HTTP_METHOD;

  switch (method) {
    case 'GET':
      return res.send(await getInventoryById({ id }));
    case 'HEAD':
      break;
    case 'OPTIONS':
      break;
    case 'POST':
    case 'PUT':
      return res.send(await createInventory({ inventory: req.body }));
    case 'DELETE':
      return res.send(await closeInventory(idIsVin ? { vin: id } : { id }));
    case 'PATCH':
      break;
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
};

export default withSessionRoute(InventoryByIdHandler);
