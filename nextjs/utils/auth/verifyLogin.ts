import { Session } from '@/types/Session';

const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;

export const verifyLogin = (
  username: string,
  password: string,
): Session['user'] | null => {
  if (username === adminUsername && password === adminPassword) {
    return { username: adminUsername, isAdmin: true };
  }
  return null;
};
