import send from './send';
import handleUrl from '@/utils/handleUrl';

export default async function notifyInventory({
  inventory,
  id,
  type = 'CREATE',
}: {
  inventory: string;
  id: string;
  type: 'UPDATE' | 'CREATE' | 'DELETE';
}) {
  const message = inventory;

  return send({
    title: `Inventory ${
      type === 'CREATE' ? 'Created' : type === 'UPDATE' ? 'Updated' : 'Deleted'
    }`,
    priority: 0,
    message,
    url: type !== 'DELETE' ? handleUrl(`/inventory?id=${id}`) : undefined,
    url_title: type !== 'DELETE' ? 'View Inventory' : undefined,
  });
}
