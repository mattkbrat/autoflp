import send from './send';
import handleUrl from '@/utils/handleUrl';

export default async function notifyAccount({
  fullName,
  license,
  type = 'CREATE',
  aid,
}: {
  type: 'DELETE' | 'CREATE' | 'UPDATE';
  fullName?: string;
  license?: string;
  aid: string;
}) {
  fullName = fullName || license;

  const message =
    type === 'CREATE'
      ? `New account ${fullName} added`
      : type === 'UPDATE'
      ? `Updated account ${fullName}`
      : `Deleted account ${fullName}`;

  const success = await send({
    title: `Person ${
      type === 'CREATE' ? 'Created' : type === 'UPDATE' ? 'Updated' : 'Deleted'
    }`,
    priority: 0,
    sound: 'classical',
    message,
    url: handleUrl(`accounts/${aid}`),
    url_title: 'View Person',
  });

  return success;
}
