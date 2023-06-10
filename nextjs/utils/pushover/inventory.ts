import send from './send';
import handleUrl from "@/utils/handleUrl";

export default async function notifyInventory({
  inventory,
  id,
  type = 'CREATE',
}: {
  inventory: string;
  id: string;
  type: 'UPDATE' | 'CREATE' | 'DELETE';
}) {
  let message: string;

  switch (type) {
    case 'CREATE':
      message = `New inventory item ${inventory} added`;
      break;
    case 'UPDATE':
      message = `Updated inventory item ${inventory}`;
      break;
    case 'DELETE':
      message = `Deleted inventory item ${inventory}`;
      break;
    default:
      throw new Error('Invalid type');
  }

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
