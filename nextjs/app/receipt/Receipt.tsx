import { Stack } from '@chakra-ui/react';
import AmortizationSchedule from '@/components/AmortizationSchedule';

function Receipt({ id }: { id: string }): JSX.Element {
  if (id === null || id === undefined) return <div>Not found</div>;

  return (
    <Stack>
      <AmortizationSchedule defaultPrint={true} id={id} defaultShow={true} />
    </Stack>
  );
}

export default Receipt;
