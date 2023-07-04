import send from './send';
import handleUrl from '@/utils/handleUrl';

export default async function notifyPerson({
  fullName,
  type = 'CREATE',
  pid,
}: {
  type: 'DELETE' | 'CREATE' | 'UPDATE';
  fullName: string;
  pid: string;
}) {
  const message =
    type === 'CREATE'
      ? `New person ${fullName} added`
      : type === 'UPDATE'
      ? `Updated person ${fullName}`
      : `Deleted person ${fullName}`;

  const success = await send({
    title: `Person ${
      type === 'CREATE' ? 'Created' : type === 'UPDATE' ? 'Updated' : 'Deleted'
    }`,
    priority: 0,
    sound: 'classical',
    message,
    url: handleUrl(`person?pid='+${pid}`),
    url_title: 'View Person',
  });

  return success;
}
