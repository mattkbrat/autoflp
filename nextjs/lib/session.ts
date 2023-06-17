import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
} from 'next';

import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next';

import { sessionOptions } from '@/lib/auth/sessionOptions';

import { Session } from '@/types/Session';

declare module 'iron-session' {
  interface IronSessionData {
    user?: Session['user'];
  }
}
