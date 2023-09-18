import send from './send';
import handleUrl from '@/utils/handleUrl';
import financeFormat from '@/utils/finance/format';
import formatInventory from '@/utils/format/formatInventory';

export default async function notifyPayment({
  amount,
  name,
  // remainingBalance,
  pid,
  type = 'POST',
  inventory: { make, model, year },
}: {
  amount: number;
  name: string;
  // remainingBalance: number;
  pid: string;
  type: 'DELETE' | 'POST';
  inventory: {
    make: string;
    model?: string | null;
    year: string;
  };
}) {
  const finance = financeFormat({ num: amount });

  const inventoryString = formatInventory({
    make,
    model,
    year,
  });

  const message =
    type === 'POST'
      ? `${name} paid ${finance} towards the ${inventoryString}`
      : `Deleted payment of ${finance} from ${name} against the ${inventoryString}`;

  return send({
    title: `Payment ${type === 'POST' ? 'Received' : 'Deleted'}`,
    priority: 0,
    sound: 'classical',
    message,
    url: handleUrl(`person?pid='+${pid}`),
    url_title: 'View Person',
  });
}
