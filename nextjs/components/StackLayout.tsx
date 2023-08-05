'use client';

import { useColors } from '@/hooks/useColors';
import { Stack, StackProps } from '@chakra-ui/react';

export default function StackLayout({
  children,
  ...props
}: {
  children: React.ReactNode;
} & StackProps) {
  const { accent, highlight } = useColors();

  return (
    <Stack
      bg={accent}
      outline={`-1rem solid ${highlight}`}
      boxShadow={`0 0 0 1px ${highlight}`}
      px={4}
      py={2}
      minH={'100dvh'}
      marginInline={{
        base: '0.5rem',
        xl: '3rem',
      }}
      spacing={4}
      {...props}
    >
      {children}
    </Stack>
  );
}
