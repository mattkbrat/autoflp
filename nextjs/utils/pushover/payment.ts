import send from './send';
import handleUrl from '@/utils/handleUrl';

export default async function notifyPayment({
  amount,
  name,
  // remainingBalance,
  pid,
  type = 'POST',
}: {
  amount: number;
  name: string;
  // remainingBalance: number;
  pid: string;
  type: 'DELETE' | 'POST';
}) {
  const finance = financeFormat({ num: amount });

  const message =
    type === 'POST'
      ? `${name} paid ${finance}`
      : `Deleted payment of ${finance} from ${name}`;

  const success = await send({
    title: `Payment ${type === 'POST' ? 'Received' : 'Deleted'}`,
    priority: 0,
    sound: 'classical',
    message,
    url: handleUrl(`person?pid='+${pid}`),
    url_title: 'View Person',
  });

  return success;
}
