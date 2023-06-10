// A debounced input react component
import { InputHTMLAttributes, useEffect, useState } from 'react';

import { Input } from '@chakra-ui/react';

export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    // @ts-ignore
    <Input
      {...props}
      value={value}
      onChange={({ target: { value } }) => setValue(value)}
    />
  );
}
