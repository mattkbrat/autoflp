import { salesman } from '@prisma/client';

import getPeople from '@/utils/prisma/person/getPeople';
import getPerson from '@/utils/prisma/person/getPerson';
import { AsyncReturnType } from '../AsyncReturn';

export type Person = NonNullable<AsyncReturnType<typeof getPerson>>;
export type People = AsyncReturnType<typeof getPeople>;

export type PersonCreditor = People[number]['creditors'][number];
export type PersonAccount = People[number]['account'];
export type PersonSalesman = People[number]['salesman'];

export type Salesman = salesman;
