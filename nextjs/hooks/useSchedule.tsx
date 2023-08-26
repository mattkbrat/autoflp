import { DefaultAmortizationSchedule } from '@/components/AmortizationSchedule';
import { ScheduleType } from '@/pages/api/schedule';
import { ParsedAmortizationSchedule } from '@/types/Schedule';
import { useEffect, useRef, useState } from 'react';

const useSchedule = ({
  dealId: id,
  defaultSchedule,
}: {
  dealId?: string;
  defaultSchedule?: DefaultAmortizationSchedule;
}) => {
  const dSRef = useRef(defaultSchedule);
  const [schedule, setSchedule] = useState<ParsedAmortizationSchedule | null>(null);

  useEffect(() => {
    if (defaultSchedule !== dSRef.current) {
      dSRef.current = defaultSchedule;
      setSchedule(null);
    }
  }, [defaultSchedule]);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        return await fetch(
          id ? '/api/account/schedule?id=' + id : '/api/account/schedule',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              !defaultSchedule
                ? {}
                : {
                    principal: +(defaultSchedule.principal || 0),
                    annualRate: +(defaultSchedule.annualRate || 0),
                    initialDate: new Date(defaultSchedule.startDate),
                    numberOfPayments: +(defaultSchedule.numberOfPayments || 0),
                    pmt: +(defaultSchedule.pmt || 0),
                    finance: defaultSchedule.finance,
                  },
            ),
          },
        ).then(async (res) => {
          return (await res.json()) as ParsedAmortizationSchedule;
        });
      } catch (e) {
        console.error('Error fetching schedule', e);
        return null;
      }
    }

    if (schedule) {
      return;
    }

    fetchSchedule().then((schedule) => {
      setSchedule(schedule || null);
    });
  }, [id, defaultSchedule, schedule]);

  return schedule;
};

export default useSchedule;
