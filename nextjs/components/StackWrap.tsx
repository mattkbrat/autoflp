import { useColors } from '@/hooks/useColors';
import { Heading, Stack, StackProps } from '@chakra-ui/react';

type stackDirection = 'row' | 'column';

export default function StackWrap({heading, ...props} : {heading: string} & StackProps) {

  
  const colors = useColors();

  const bg = props.bg || colors.accent;

  const {
    padding = 4,
    m = 'none',
    backdropBlur = true,
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
