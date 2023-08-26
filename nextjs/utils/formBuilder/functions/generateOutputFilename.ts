import { Deal, Person } from '@prisma/client';
import { fullNameFromPerson } from './fullNameFromPerson';
import { Form } from '@/types/forms';
import formatDate from '@/utils/date/format';

function generateOutputFilename({
  deal,
  person,
  form,
}: {
  deal?: Deal;
  person?: Person | null;
  form: Form | Form[];
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
