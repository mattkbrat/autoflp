const password = process.env.SESSION_COOKIE_PASSWORD as string;
const cookieName = process.env.SESSION_COOKIE_NAME as string;

export const sessionOptions = {
  cookieName,
  password,
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};
