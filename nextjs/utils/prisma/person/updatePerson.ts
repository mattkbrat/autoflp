import prisma from '@/lib/prisma';

import { Person } from '@prisma/client';

const updatePerson = (person: Partial<Person>) => {
  if (!person.id) throw new Error('No person id provided');
  return prisma.person.update({
    where: { id: person.id },
    data: person,
  });
};

export default updatePerson;
