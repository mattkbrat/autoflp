import { person } from '@prisma/client';

const DisplayPerson = ({ person }: { person: person }) => {
  return (
    <>
      <pre>{JSON.stringify(person, null, 2)}</pre>
    </>
  );
};

export default DisplayPerson;
