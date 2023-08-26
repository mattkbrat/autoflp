import { useEffect, useState } from 'react';
import { Account } from '@/types/prisma/accounts';
import { Spinner, Stack, Text } from '@chakra-ui/react';

//  {id: string, contact: string, cosigner: string | null, date_of_birth: string | null, license_number: string, license_expiration: string | null, date_added: string | null, date_modified: string | null, current_standing: string | null, notes: string | null
const AccountCard = ({
  account: defaultAccount,
  id,
}: {
  account?: Account;
  id?: string;
}) => {
  const [account, setAccount] = useState(defaultAccount || null);

  useEffect(() => {
    id &&
    setAccount(null);
  }, [id]);

  useEffect(() => {
    if (!account && id) {
      fetch(`/api/account/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setAccount(data);
        });
    }
  }, [account, id]);

  if (!account) {
    return <Spinner />;
  }

  return (
    <Stack>
      <Text>
        {account?.license_number} ({account?.license_expiration})
      </Text>
      <Text>{account?.contact}</Text>
      <Text>{account?.cosigner}</Text>
      <Text>{account?.date_of_birth}</Text>
      <Text>{account?.date_added}</Text>
      <Text>{account?.date_modified}</Text>
      <Text>{account?.current_standing}</Text>
    </Stack>
  );
};

export default AccountCard;
