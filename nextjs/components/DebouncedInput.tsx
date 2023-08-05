// A debounced input react component
import { useEffect, useState } from 'react';

import { Input, InputProps } from '@chakra-ui/react';

type InputValue = InputProps['value'];

export function DebouncedInput<Input extends InputValue>({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: Input;
  onChange: (value: InputValue) => void;
  debounce?: number;
} & Omit<InputProps, 'onChange'>) {
  const [value, setValue] = useState<InputProps['value']>(initialValue);

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
    <Input
      {...props}
      value={value}
      onChange={({ target: { value } }) => setValue(value)}
    />
  );
}
