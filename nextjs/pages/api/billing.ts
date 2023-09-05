import { NextApiRequest, NextApiResponse } from 'next';
import { withSessionRoute } from '@/utils/auth/withSession';
import generateBillingStatements from '@/utils/formBuilder/billing';
import { getBilling } from '@/utils/finance/getBilling';

const BillingHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { user } = req.session;

  if (!user) return res.status(401).json({ message: 'Unauthorized' });

  switch (req.method) {
    case 'GET':
      const billing = await getBilling();
      res.status(200).json(billing);
      break;
    case 'POST':
      const generated = await generateBillingStatements();
      res.status(200).json(generated);
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
};

export default withSessionRoute(BillingHandler);
