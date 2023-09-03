import financeFormat from '../finance/format';
import send from './send';
import handleUrl from '@/utils/handleUrl';

export default async function notifyDeal({
  amount,
  dealId,
  type = 'CREDIT',
  invString,
  fullName,
}: {
  amount?: number;
  dealId: string;
  type: 'CASH' | 'CREDIT' | 'UPDATE' | 'CLOSE';
  invString: string;
  fullName: string;
}) {
  const finance = financeFormat({ num: amount });

  let message;

  // const message =
  //     type === 'CLOSE' ? `Closed ${fullName} ${invString}` : `${invString} for ${finance} from ${fullName}`

  switch (type) {
    case 'CLOSE':
      message = `Closed ${fullName} ${invString}`;
      break;
    case 'UPDATE':
      message = `Updated ${fullName} ${invString}`;
      break;
    case 'CASH':
    case 'CREDIT':
      message = `${invString} for ${finance} from ${fullName}`;
      break;
    default:
      throw new Error('Invalid type');
  }

  const urlParams = new URLSearchParams({
    filter: dealId.split('-')[0],
  }).toString();

  const success = await send({
    title:
      type === 'CLOSE'
        ? 'Closed deal'
        : `${
            type === 'UPDATE'
              ? 'Updated deal'
              : `New ${type === 'CASH' ? 'cash' : 'credit'} deal`
          }`,
    priority: 1,
    sound: 'cashregister',
    message,
    url: handleUrl(urlParams),
    url_title: 'View Account',
  });

  return success;
}
