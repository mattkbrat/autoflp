import prisma from '@/lib/prisma';

import { Person } from '@prisma/client';
import { randomUUID } from 'crypto';

const createPerson = async (data: Person) => {
  console.log('createPerson', data);

  return prisma.$transaction(async (tx) => {
    const person = await tx.person.create({
      data: {
        ...data,
        id: randomUUID(),
      },
    });

    const now = new Date().toISOString().split('T')[0];

    const account = await tx.account.create({
      data: {
        contact: person.id,
        id: randomUUID(),
        license_number: randomUUID(),
        date_modified: now,
        date_added: now,
      },
    });
    return { person, account };
  });
};

export default createPerson;
