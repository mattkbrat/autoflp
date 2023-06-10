import { useMediaQuery } from '@chakra-ui/react';

export default function useIsMobile() {
  const [isMobile] = useMediaQuery('min-width:600px');
  return isMobile;
}
