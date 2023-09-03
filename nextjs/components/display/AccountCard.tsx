import { useEffect, useState } from 'react';
import { Account } from '@/types/prisma/accounts';
import {
  Spinner,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Tr,
} from '@chakra-ui/react';
import Link from 'next/link';

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
    id && setAccount(null);
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
      <TableContainer>
        <Table>
          <Tbody>
            <Tr>
              <Th>License (expiration)</Th>
              <Td>
                {account?.license_number} ({account?.license_expiration})
              </Td>
            </Tr>
            <Tr>
              <Th>Date of Birth</Th>
              <Td>{account?.date_of_birth}</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
      <Link href={`/accounts/${account.id}`}>Edit</Link>
    </Stack>
  );
};

export default AccountCard;
