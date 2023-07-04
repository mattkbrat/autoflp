import { Button } from '@chakra-ui/react';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import formatInventory from '@/utils/format/formatInventory';
import { person } from '@prisma/client';
import { DealWithInventory } from '@/utils/prisma/inventory';

export const deleteAccount = (id: string) => {
  return fetch(`/api/accounts/${id}`, {
    method: 'DELETE',
  });
};

const DeleteAccountButton = ({
  info,
}: {
  info: {
    row: {
      original: {
        id: string;
        person: person;
        deal_deal_accountToaccount: DealWithInventory[];
      };
    };
  };
}) => {
  return (
    <Button
      onClick={async () => {
        const accountID = info.row.original.id;
        const fullName = fullNameFromPerson(info.row.original.person);
        const invString = formatInventory(
          info.row.original.deal_deal_accountToaccount[0]
            ?.inventory_deal_inventoryToinventory,
        );
        const account = `${fullName} - ${invString}`;
        if (!confirm(`Are you sure you want to delete ${account}`)) return;
        await deleteAccount(accountID);
      }}
    >
      Delete
    </Button>
  );
};

export default DeleteAccountButton;
