// pages/api/auth/login.ts

import { withIronSessionApiRoute } from 'iron-session/next';
import { logger } from '@/lib/winston';

import { sessionOptions } from '@/lib/auth/sessionOptions';
import { verifyLogin } from '@/utils/auth/verifyLogin';

export default withIronSessionApiRoute(async function loginRoute(req, res) {
  try {
    const { username, password } = req.body;

    if (typeof username === 'undefined' || typeof password === 'undefined') {
      res.status(400).send('Bad Request');
      return;
    }

    const creds = verifyLogin(username, password);

    if (!creds) {
      console.warn('no creds');
      res.status(401).json('Unauthorized');
      return;
    }

    if (!creds?.username) {
      res.status(401);
      logger.warn('login', { message: 'no username in creds' });
      return;
    }

    req.session = { ...req.session, user: creds };
    await req.session.save();

    logger.info('new login', { user: req.session.user });

    res.status(200).json({ user: creds });
  } catch (error) {
    logger.error('login', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

  return;
}, sessionOptions);
