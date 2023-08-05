import { useColorModeValue } from '@chakra-ui/react';

const hsl2097198 = `hsl(209, 71%, 98%)`;
const hsl2097112 = 'hsl(209, 71%, 12%)';

const transparentWhite = `rgba(255, 255, 255, 0.7)`;
const transparentBlack = `rgba(0, 0, 0, 0.7)`;

const accentLight = 'hsl(30, 80%, 98%)';
const accentDark = 'hsl(30, 80%, 3%)';

const highlightLight = '#262626';
const highlightDark = '#fef7fa';

export const useColors = () => {
  return {
    eggshellWhite: hsl2097198 as typeof hsl2097198,
    darkMidnightBlue: hsl2097112 as typeof hsl2097112,
    transparentWhite: transparentWhite as typeof transparentWhite,
    transparentBlack: transparentBlack as typeof transparentBlack,
    bg: useColorModeValue(hsl2097198, hsl2097112) as
      | typeof hsl2097198
      | typeof hsl2097112,
    header: useColorModeValue(transparentWhite, transparentBlack) as
      | typeof transparentWhite
      | typeof transparentBlack,
    accent: useColorModeValue(accentLight, accentDark) as
      | typeof accentLight
      | typeof accentDark,
    highlight: useColorModeValue(highlightLight, highlightDark) as
      | typeof highlightLight
      | typeof highlightDark,
  };
};
