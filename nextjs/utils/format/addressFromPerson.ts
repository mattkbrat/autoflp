import { person } from '@prisma/client';

export function addressFromPerson(person: person | null) {
  const res = {
    full: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    cityStateZip: '',
  };

  if (person === null || typeof person === undefined) return res;

  const address1 = person?.address_1 ?? '';
  const address2 = person?.address_2 ?? '';
  const address3 = person?.address_3 ?? '';

  const address = [address1, address2, address3].filter((a) => a !== '').join(', ');

  const city = person?.city ?? '';
  const state = person?.state_province ?? '';
  const zip = person?.zip_postal ?? '';

  res.cityStateZip = `${city}, ${state} ${zip}`;
  res.full = `${address} ${res.cityStateZip}`;
  res.street = address;
  res.city = city;
  res.state = state;
  res.zip = zip;

  return res;
}
