'use client';

import {
  Box,
  Flex,
  IconButton,
  Link,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import useBackground from '@/hooks/useBackground';
import { BiRefresh } from 'react-icons/bi';

export default function BackgroundLayout({
  children,
  backgroundImage,
}: {
  children: React.ReactNode;
  backgroundImage?: string;
}) {
  const bg = useColorModeValue('whiteAlpha.800', 'blackAlpha.800'); // Less transparent on mobile

  const { background, deleteBackground } = useBackground({
    query: backgroundImage || 'old truck',
  });

  return (
    <Flex
      backgroundImage={`url(${background?.image.direct})`}
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      backgroundSize="cover"
      backdropFilter={'blur(20px)'}
      w={'100vw'}
      minH="88vh"
      position={'relative'}
      p={{
        base: 1,
        md: 2,
        lg: 10,
      }}
      alignItems={'center'}
    >
      <Stack
        background={bg}
        justifyContent={'center'}
        backdropBlur={'lg'}
        backdropFilter={'blur(2px)'}
        borderRadius={'xl'}
        m={{
          base: 0,
          md: 2,
          lg: 10,
        }}
        p={{
          base: 1,
          md: 2,
          lg: 10,
        }}
      >
        {children}
      </Stack>
      <Box position={'absolute'} bottom={2} right={2}>
        <Box
          background={bg}
          backdropBlur={'lg'}
          backdropFilter={'blur(2px)'}
          fontSize={'xs'}
          color={'gray.500'}
          p={2}
          borderRadius={'sm'}
          fontFamily={'monospace'}
        >
          <Link
            href={background?.image.unsplash}
            target={'_blank'}
            rel={'noreferrer'}
          >
            Photo by
          </Link>{' '}
          <Link
            href={background?.attribution.link}
            target={'_blank'}
            rel={'noreferrer'}
          >
            {background?.attribution.name}
          </Link>{' '}
          on{' '}
          <Link href={'https://unsplash.com/'} target={'_blank'} rel={'noreferrer'}>
            Unsplash
          </Link>
          <IconButton
            aria-label={'Delete background'}
            icon={<BiRefresh />}
            onClick={deleteBackground}
            size={'xs'}
            ml={2}
          />
        </Box>
      </Box>
    </Flex>
  );
}
