import { NextApiRequest, NextApiResponse } from 'next';

import { withIronSessionApiRoute } from 'iron-session/next';

import { sessionOptions } from '@/lib/auth/sessionOptions';

function logoutHandler(req: NextApiRequest, res: NextApiResponse) {
  req.session?.destroy();
  console.log('req.session', req.session);
  res.status(200).json({ message: 'Logged out', user: null });
}

export default withIronSessionApiRoute(logoutHandler, sessionOptions);
