'use client';

import {
  Spinner,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Tr,
} from '@chakra-ui/react';
import { Person } from '@/types/prisma/person';
import { addressFromPerson } from '@/utils/format/addressFromPerson';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import { useEffect, useMemo, useState } from 'react';

const PersonCard = ({
  person: defaultPerson,
  id,
}: {
  id?: string;
  person?: Person;
}) => {
  // const { full: address } = addressFromPerson(person);
  // const name = id && fullNameFromPerson(id);

  const [person, setPerson] = useState<Person | null>(defaultPerson || null);

  useEffect(() => {
    id && setPerson(null);
  }, [id]);

  useEffect(() => {
    if (!person && id) {
      fetch(`/api/person/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setPerson(data);
        });
    }
  }, [person, id]);

  const name = useMemo(() => {
    if (person) {
      return fullNameFromPerson(person);
    }
    return '';
  }, [person]);

  const address = useMemo(() => {
    return person ? addressFromPerson({ person }).full.toUpperCase() : '';
  }, [person]);

  if (!person) {
    return <Spinner />;
  }

  return (
    <TableContainer>
      <Table>
        <Tbody>
          <Tr>
            <Th>Name</Th>
            <Td>{name}</Td>
          </Tr>
          <Tr>
            <Th>Address</Th>
            <Td>{address}</Td>
          </Tr>
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default PersonCard;
