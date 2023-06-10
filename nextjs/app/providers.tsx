// app/providers.tsx
'use client';

import React from 'react';

import { default as colorTheme } from '@/app/theme';
import { CacheProvider } from '@chakra-ui/next-js';
// 1. Import the extendTheme function
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react';

// 2. Extend the theme to include custom colors, fonts, etc
const colors = {
  brand: {
    900: '#1a365d',
    800: '#153e75',
    700: '#2a69ac',
  },
};

export const theme = extendTheme({ colors, colorTheme });

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </CacheProvider>
  );
}
