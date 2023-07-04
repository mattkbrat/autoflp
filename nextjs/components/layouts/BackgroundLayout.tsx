'use client';

import style from '@/styles/Gradients.module.css';

import {
  Box,
  Flex,
  Heading,
  IconButton,
  Link,
  Stack,
  StackProps,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import useBackground from '@/hooks/useBackground';
import { BiRefresh } from 'react-icons/bi';
import { useMemo } from 'react';
import Image from 'next/image';

export default function BackgroundLayout({
  children,
  backgroundImage,
  heading,
  headingProps,
  withGradient,
  ...stackProps
}: {
  children: React.ReactNode;
  heading?: string;
  headingProps?: StackProps;
  withGradient?: boolean;
  backgroundImage?: string;
} & StackProps) {
  const bg = useColorModeValue('whiteAlpha.800', 'blackAlpha.800'); // Less transparent on mobile

  const { background, deleteBackground } = useBackground({
    query: !withGradient ? null : backgroundImage || 'pickup truck',
  });

  const imageHeight = useMemo(() => {
    if (!background?.image) return '100vh';
    const height = background.image.height;
    if (height > 1000) return '100vh';
    return `${height}px`;
  }, [background?.image]);

  const colorScheme = useColorModeValue('light', 'dark');

  return (
    <Flex
      w={'full'}
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
        justifyContent={'center'}
        background={bg}
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
        {...stackProps}
      >
        {heading && <Heading {...headingProps}>{heading}</Heading>}
        {background.image.height && (
          <Box
            position={'absolute'}
            top={0}
            left={0}
            zIndex={-1}
            w={'100%'}
            h={'full'}
          >
            {withGradient ? (
              <Box
                className={style[colorScheme]}
                position={'absolute'}
                top={0}
                left={0}
                zIndex={-1}
                w={'100%'}
                h={'full'}
              />
            ) : (
              <Image
                src={background?.image.direct}
                alt="Background"
                width={background.image.width}
                height={background.image.height}
                layout={'responsive'}
                objectFit={'cover'}
                objectPosition={'center'}
                quality={100}
                priority={true}
                placeholder={'blur'}
                blurDataURL={background?.image.direct}
                style={{
                  borderRadius: '1rem',
                  filter: 'blur(5px)',
                }}
              />
            )}
          </Box>
        )}
        {children}
      </Stack>
      <Box position={'absolute'} top={2} right={2}>
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
