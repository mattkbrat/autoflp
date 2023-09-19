'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import ComboBox from '@/components/ComboBox';
import { usePathname, useRouter } from 'next/navigation';
import isDev from '@/lib/isDev';
import Link from 'next/link';

export type SearchOption = {
  display: string;
  path: string;
};

const GlobalSearch = ({ searchOptions }: { searchOptions: SearchOption[] }) => {
  const [selected, setSelected] = useState<SearchOption | undefined>();

  const router = useRouter();
  const pathname = usePathname();

  const setValue = (value: string | number) => {
    setSelected(searchOptions.find((s) => s.display === value));
  };

  useEffect(() => {
    if (!selected?.path) return;
    router.push(selected.path);

    // Reset the selected option
    return () => {
      setSelected(undefined);
    };
  }, [selected, router, searchOptions, pathname]);

  const options = useMemo(
    () => searchOptions.map((s) => s.display),
    [searchOptions],
  );

  return <ComboBox options={options} setValue={setValue} />;
};

export default memo(GlobalSearch);
