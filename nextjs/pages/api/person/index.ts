import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/utils/auth/withSession';
import getPerson from '@/utils/prisma/person/getPerson';
import getPeople from '@/utils/prisma/person/getPeople';
import { HTTP_METHOD } from 'next/dist/server/web/http';
import updatePerson from '@/utils/prisma/person/updatePerson';
import createPerson from '@/utils/prisma/person/createPerson';

const PersonHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  const { user } = req.session;

  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  const method = req.method as HTTP_METHOD;

  try {
    switch (method) {
      case 'GET':
        if (typeof id !== 'string') {
          return res.send(await getPeople());
        }
        return res.send(await getPerson({ id: id }));
        break;
      case 'HEAD':
        break;
      case 'OPTIONS':
        break;
      case 'POST':
        return res.send(await createPerson(req.body));
        break;
      case 'PUT':
        return res.send(await updatePerson({ id: id, ...req.body }));
        break;
      case 'DELETE':
        break;
      case 'PATCH':
        break;
    }
  } catch (error: any) {
    console.error('/api/person', error.message);
    return res.status(500).json({ message: error.message });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
};

export default withSessionRoute(PersonHandler);
