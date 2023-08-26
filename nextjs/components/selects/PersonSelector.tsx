import { memo, useEffect, useMemo, useState } from 'react';

import {
  Button,
  FormControl,
  FormLabel,
  Select,
  Spacer,
  Stack,
} from '@chakra-ui/react';
import { People } from '@/types/prisma/person';
import formatPreposition from '@/utils/format/formatPreposition';

function PersonSelector(props: {
  pid?: string | null;
  onChange?: (
    person:
      | People[number]
      | People[number]['creditors'][number]
      | People[number]['account'],
  ) => void;
  filter?: 'all' | 'creditor' | 'salesman' | 'account';
  withNew?: boolean;
  isDisabled?: boolean;
  setPid?: React.Dispatch<React.SetStateAction<string | null>>;
  setAid?: React.Dispatch<React.SetStateAction<string | null>>;
  people?: People;
  isInvalid?: boolean;
  label?: string;
}) {
  const [people, setPeople] = useState<undefined | People>(props.people);
  const [filter, setFilter] = useState<'creditor' | 'salesman' | 'account' | 'all'>(
    props.filter || 'all',
  );

  const isCreditor = filter === 'creditor';
  const isSalesman = filter === 'salesman';

  useEffect(() => {
    if (typeof props.people !== 'undefined') {
      return;
    }
    fetch('/api/person')
      .then((r) => r.json())
      .then((data) => {
        setPeople(data);
      });
  }, [props.people]);

  // Filter people by
  const filteredPeople = useMemo(() => {
    if (!filter || filter === 'all') {
      if (!people) {
        return [];
      }
      return people;
    } else {
      return people?.filter((person) => {
        if (filter === 'creditor') {
          return person.creditors.length > 0;
        } else if (filter === 'salesman') {
          return person.salesman;
        } else if (filter === 'account') {
          return person.account;
        }
      });
    }
  }, [people, filter]);

  return (
    <Stack
      direction={{ base: 'column', md: 'row' }}
      spacing={{ base: 2, md: 4 }}
      w={'full'}
    >
      <FormControl
        isRequired={true}
        isDisabled={props.isDisabled}
        isInvalid={props.isInvalid === true}
      >
        {props.label ? <FormLabel>{props.label}</FormLabel> : null}
        <Select
          isDisabled={props.isDisabled}
          isInvalid={props.isInvalid}
          onChange={(e) => {
            e.preventDefault();
            const id: NonNullable<People[number]['account']>['id'] = e.target.value;

            const person = people?.find((person: People[number]) => {
              if (!person.id) {
                console.warn('Person has no id', person);
                return false;
              }
              return person.id === id;
            });

            console.log('person', person);

            if (props.onChange && person) {
              console.log('person', person);
              if (isCreditor) {
                console.log('person.creditors[0]', person.creditors);
                return props.onChange(person.creditors[0]);
              }
              return props.onChange(person);
            }

            if (props.setAid) {
              props.setAid(person?.account?.id || '');
            }

            if (props.setPid) {
              props.setPid(person?.id || e.target.value || '');
            }
          }}
          w="100%"
          textTransform={'capitalize'}
          fontSize={{
            base: 'lg',
            md: 'xl',
            lg: '2xl',
          }}
          defaultValue={props.pid ?? ''}
          placeholder={
            filter === 'all'
              ? 'Select from all accounts'
              : `Select ${formatPreposition(filter)}`
          }
        >
          {filteredPeople?.map((person: People[number]) => {
            return (
              <option
                style={{
                  textTransform: 'capitalize',
                  fontSize: '1em',
                }}
                key={person.id}
                value={person.id}
              >
                {isCreditor
                  ? person.creditors[0].business_name?.toUpperCase()
                  : [person.last_name, person.first_name].join(', ').toUpperCase()}
              </option>
            );
          })}
        </Select>
      </FormControl>

      <Spacer />
      {typeof props.filter === 'undefined' && (
        <Button
          onClick={() => {
            if (filter === 'all') {
              setFilter('creditor');
            } else if (isCreditor) {
              setFilter('salesman');
            } else if (isSalesman) {
              setFilter('all');
            }
          }}
          m={2}
          fontSize={'1rem'}
          colorScheme={'blue'}
        >
          {filter.toUpperCase()}
        </Button>
      )}
    </Stack>
  );
}

export default memo(PersonSelector);
