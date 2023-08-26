import React from 'react';

import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  Tooltip,
} from '@chakra-ui/react';
import formatPhoneNumber from '@/utils/format/formatPhoneNumber';
import formatEmail, { emailRegexString } from '@/utils/format/formatEmail';
import { AnyObject } from 'chart.js/dist/types/basic';

const anyStringRegexString = '.*';

function parse(name: string, value: string): string | number | boolean | undefined {
  if (!value || !name) {
    return '';
  }

  const formatted = name.includes('phone')
    ? formatPhoneNumber(value)
    : name.includes('email')
    ? formatEmail(value)
    : value;

  if ([null, undefined, 'null', ''].includes(formatted?.toLowerCase())) {
    return '';
  }

  return formatted;
}

export function TextInput(props: {
  name: string;
  value?: string;
  label?: string;
  changes?: AnyObject;
  setChanges?: React.Dispatch<React.SetStateAction<AnyObject>>;
  isDisabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  defaultValue?: string;
  tooltip?: string;
  textTransform?: 'uppercase' | 'capitalize' | 'lowercase' | 'none';
  inputElement?: {
    side: 'left' | 'right';
    element: JSX.Element;
  };
}): JSX.Element {
  const id = props.name + '-input';

  const {
    name,
    label,
    changes,
    setChanges,
    isRequired,
    isDisabled,
    isInvalid,
    tooltip,
    defaultValue,
    textTransform = 'uppercase',
  } = props;
  // const formTitle = label.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');

  const inputElement = props.inputElement ? props.inputElement.element : null;

  const inputGroup = (
    <InputGroup>
      {props.inputElement && props.inputElement.side === 'left'
        ? inputElement
        : null}

      <Input
        pattern={name.includes('email') ? emailRegexString : anyStringRegexString}
        type={
          name.includes('email')
            ? 'email'
            : name.includes('phone')
            ? 'tel'
            : name.includes('date') || name.includes('expiration')
            ? 'date'
            : 'text'
        }
        style={{
          textTransform: textTransform,
        }}
        fontSize="lg"
        placeholder={name.replace('_', ' ')}
        value={
          typeof props.value !== 'undefined'
            ? props.value
            : (parse(
                label ?? name,
                changes ? changes[name] : defaultValue ? defaultValue : '',
              ) as string)
        }
        onChange={(e) =>
          setChanges &&
          setChanges({ ...changes, [name]: parse(name, e.target.value) })
        }
      />

      {props.inputElement && props.inputElement.side === 'right'
        ? inputElement
        : null}
    </InputGroup>
  );

  return (
    <FormControl
      id={id}
      isInvalid={isInvalid}
      isDisabled={isDisabled}
      isRequired={isRequired}
    >
      {label === undefined ? null : (
        <FormLabel
          style={{
            textTransform: 'capitalize',
          }}
        >
          {label}
        </FormLabel>
      )}

      {tooltip ? (
        <Tooltip label={tooltip} aria-label={tooltip}>
          {inputGroup}
        </Tooltip>
      ) : (
        inputGroup
      )}
    </FormControl>
  );
}
