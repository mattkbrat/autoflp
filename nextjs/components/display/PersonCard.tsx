'use client';

import { Spinner, Stack } from '@chakra-ui/react';
import { Person } from '@/types/prisma/person';
import { addressFromPerson } from '@/utils/format/addressFromPerson';
import { fullNameFromPerson } from '@/utils/format/fullNameFromPerson';
import { useEffect, useMemo, useState } from 'react';

const PersonCard = ({ person: defaultPerson, id }: { id?: string, person?: Person }) => {
  // const { full: address } = addressFromPerson(person);
  // const name = id && fullNameFromPerson(id);

  const [person, setPerson] = useState<Person>(defaultPerson || null);

  useEffect(() => {
    id &&
    setPerson(null)
  }, [id]);

  useEffect(() => {
    if (!person && id) {
      fetch(`/api/person/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setPerson(data);
        }
      );
    }
  }, [person, id]);

  const name = useMemo(() => {
    if (person) {
      return fullNameFromPerson(person);
    }
    return '';
  }, [person]);

  const address = useMemo(() => {
    if (person) {
      return addressFromPerson(person).full;
    }
    return '';
  }, [person]);

  if (!person){
    return (
      <Spinner />
    )
  }


  return (
    <Stack>
      <div>{name}</div>
      <div>{address}</div>
    </Stack>
  );
};

export default PersonCard;