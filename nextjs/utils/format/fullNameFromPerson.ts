import { Person } from "@prisma/client";

export function fullNameFromPerson(
  person: {
    first_name?: string | null;
    last_name?: string | null;
    middle_initial?: string | null;
    name_prefix?: string | null;
    name_suffix?: string | null;
  },
  format: 'firstLast' | 'lastFirst' = 'lastFirst',
  titleCase = true,
) {
  if (person === null || typeof person === undefined) {
    return '';
  }

  const lastName = person?.last_name ?? '';
  const firstName = person?.first_name ?? '';
  const middleInitial = person?.middle_initial ?? '';
  const suffix = person?.name_suffix ?? '';
  const prefix = person?.name_prefix ?? '';

  let name;

  // suffix first because it's more likely to be empty
  if (suffix !== '' && prefix !== '') {
    if (format === 'firstLast') {
      name = `${firstName} ${middleInitial} ${lastName} ${suffix} ${prefix}`;
    }
    name = `${prefix} ${lastName}, ${firstName} ${middleInitial} ${suffix}`;
  } else if (suffix !== '') {
    if (format === 'firstLast') {
      name = `${firstName} ${middleInitial} ${lastName} ${suffix}`;
    }
    name = `${lastName}, ${firstName} ${middleInitial} ${suffix}`;
  } else if (prefix !== '') {
    if (format === 'firstLast') {
      name = `${firstName} ${middleInitial} ${lastName} ${prefix}`;
    }
    name = `${prefix} ${lastName}, ${firstName} ${middleInitial}`;
  } else if (middleInitial === '') {
    if (format === 'firstLast') {
      name = `${firstName} ${lastName}`;
    }
    name = `${lastName}, ${firstName}`;
  } else {
    if (format === 'firstLast') {
      name = `${firstName} ${middleInitial} ${lastName}`;
    }
    name = `${lastName}, ${firstName} ${middleInitial}`;
  }

  if (titleCase) {
    return name
      ?.split(' ')
      ?.map((word) => word && word[0].toUpperCase() + word.slice(1))
      ?.join(' ');
  }

  return name;
}
