import { Heading, Stack } from '@chakra-ui/react';

type stackDirection = 'row' | 'column';

export default function StackWrap(props: {
  children: React.ReactNode;
  direction?: stackDirection;
  spacing?: number | string | string[];
  align?: string;
  alignItems?: string;
  justifyItems?: string;
  justify?: string;
  divider?: boolean;
  bg?: string;
  backdropBlur?: string;
  border?: boolean;
  heading?: JSX.Element | string;
  padding?: number | string | { base?: number | string; md?: number | string };
  boxShadow?: string | undefined;
  m?: number | string | undefined;
  position?: string | undefined;
  overflow?: boolean;
  w?: string;
}) {
  const {
    padding = 1,
    bg = 'hsla(0, 0%, 100%, 0.1)',
    m = 'none',
    backdropBlur = true,
    heading = undefined,
    border = false,
    children,
    direction = 'column',
    spacing = 4,
    justifyItems = 'undefined',
  } = props;

  const HeadingElem = () => {
    if (!heading) {
      return null;
    }
    if (typeof heading === 'string') {
      return (
        <Heading as="h3" size="md" textAlign={'center'}>
          {heading}
        </Heading>
      );
    }
    return heading;
  };

  return (
    <Stack
      direction={direction ?? 'column'}
      spacing={spacing}
      p={padding}
      align={props.align || 'center'}
      alignItems={props.alignItems || 'left'}
      borderColor={border ? 'gray.200' : 'none'}
      borderRadius={border ? 'md' : 'none'}
      bg={bg}
      backdropBlur={backdropBlur}
      boxShadow={border ? 'sm' : 'none'}
      m={m}
      justifyItems={justifyItems}
      justifyContent={props.justify || 'center'}
      sx={{
        '&::-webkit-scrollbar': {
          width: '16px',
          borderRadius: '8px',
          backgroundColor: `rgba(0, 0, 0, 0.05)`,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: `rgba(0, 0, 0, 0.05)`,
        },
      }}
    >
      <HeadingElem />
      {children}
    </Stack>
  );
}
