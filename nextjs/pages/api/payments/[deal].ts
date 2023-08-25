import { NextApiRequest, NextApiResponse } from 'next';
import { HTTP_METHOD } from 'next/dist/server/web/http';
import {
  createPayment,
  deletePayment,
  getDealPayments,
} from '@/utils/prisma/payment';
import { withSessionRoute } from '@/utils/auth/withSession';
import { DealPayment, PaymentWithDate } from '@/types/prisma/payments';

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

  const payment: PaymentWithDate = req.body;

  switch (method) {
    case 'GET':
      return res.send(await getDealPayments({ deal }));
    case 'HEAD':
      break;
    case 'OPTIONS':
      break;
    case 'POST':
      return res.send(
        await createPayment({
          ...payment,
          deal_id: deal,
          date: payment.date.toString(),
        }),
      );
    case 'PUT':
      break;
    case 'DELETE':
      return res.send(await deletePayment({ payment: deal }));
    case 'PATCH':
      break;
  }
};

export default withSessionRoute(dealPaymentsHandler);
