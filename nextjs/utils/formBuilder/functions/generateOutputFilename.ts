import { Deal, Person } from '@prisma/client';
import { fullNameFromPerson } from './fullNameFromPerson';
import { Form } from '@/types/forms';
import formatDate from '@/utils/date/format';

function generateOutputFilename({
  deal,
  person,
  form,
  fullName,
}: {
  deal?: {
    date: Date | string;
  };
  person?: Person | null;
  fullName?: string;
  form: Form | Form[];
}): string | string[] {
  if (person === null || typeof person === 'undefined') {
    throw 'Must provide a person';
  }

  fullName = fullName || person ? fullNameFromPerson(person || {}) : 'No name';

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
