import { Session } from '@/types/Session';
import { unsealData } from 'iron-session';
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

/**
 * Can be called in page/layout server component.
 * @param cookies ReadonlyRequestCookies
 * @returns SessionUser or null
 */
export async function getRequestCookie(
  cookies: ReadonlyRequestCookies | RequestCookies,
): Promise<Session['user'] | null> {
  try {
    const cookieName = process.env.SESSION_COOKIE_NAME as string;
    const found = cookies.get(cookieName);

    if (!found) return null;

    const { user } = await unsealData(found.value, {
      password: process.env.SESSION_COOKIE_PASSWORD as string,
    });

    return user as unknown as Session['user'];
  } catch (e) {
    console.error(e);
    return null;
  }
}
