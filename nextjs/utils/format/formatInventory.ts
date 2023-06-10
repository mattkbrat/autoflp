import { Inventory } from "@/utils/prisma/inventory";

export default function formatInventory(
  inventory: Inventory[number] | undefined,
  titleCase = true,
) {
  if (inventory === undefined) {
    return '';
  }

  const inv = `${inventory.color || ''} ${inventory.year.split('.')[0]} ${inventory.make} ${
    inventory.model
  } ${inventory.vin.slice(-4)}`;

  if (titleCase) {
    return inv
      .split(' ')
      .map((word) => word && word[0].toUpperCase() + word.slice(1))
      .join(' ');
  }

  return inv;
}
