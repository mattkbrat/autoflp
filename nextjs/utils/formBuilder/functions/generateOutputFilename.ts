import { fullNameFromPerson } from './fullNameFromPerson';
import formatDate from 'lib/date/format';
import { dealByIdType } from 'lib/prisma/deals';
import { forms } from 'types/forms';

import { deal, person } from '@prisma/client';

function generateOutputFilename({
  deal,
  person,
  form,
}: {
  deal?: deal | dealByIdType;
  person?: person | null;
  form: forms | forms[];
}): string | string[] {
  if (person === null || typeof person === 'undefined') {
    throw 'Must provide a person';
  }

  const fullName = fullNameFromPerson(person);

  const date = formatDate(deal?.date ?? new Date(), 'MMMM d, yyyy');

  if (Array.isArray(form)) {
    const result = [];
    for (let i = 0; i < form.length; i++) {
      result.push(`${date} ${fullName} - ${form[i]}.pdf`);
    }
    return result;
  }

  return `${date} ${fullName} - ${form}.pdf`;
}

export default generateOutputFilename;
