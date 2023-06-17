// pages/api/user.ts

import { withIronSessionApiRoute } from 'iron-session/next';
import { sessionOptions } from '@/lib/auth/sessionOptions';

export default withIronSessionApiRoute(function userRoute(req, res) {
  // console.log("from userRoute", {user: req.session.user});
  res.send(req.session.user);
}, sessionOptions);
