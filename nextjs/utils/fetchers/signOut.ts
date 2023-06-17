// import {useRouter} from "next/router";

export default async function signOut({
  callbackUrl = '/',
}: {
  callbackUrl?: string;
}) {
  const req = await fetch('/api/auth/logout');
  console.log('signout', req, 'callbackUrl', callbackUrl);

  if (req.ok) {
    window.location = callbackUrl || '/';
  } else {
    throw new Error('Failed to sign out');
  }
}
