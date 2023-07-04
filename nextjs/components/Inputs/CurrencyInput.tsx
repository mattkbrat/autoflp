import { useEffect, useRef, useState } from 'react';

import {
  FormControl,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Tooltip,
} from '@chakra-ui/react';

/**
 * Wrapper for Chakra UI NumberInput component to support currency formatting
 * @param props
 * @constructor
 */
const CurrencyInput = (props: {
  name: number;
  max?: number;
  min?: number;
  step?: number;
  isInvalid?: boolean;
  tooltip?: {
    label: string;
    disabled?: boolean;
    position?: 'top' | 'right' | 'bottom' | 'left';
  };
  significantDigits?: number;
  isRequired?: boolean;
  isDisabled?: boolean;
  formLabel?: string;
  onChange: (valueAsString: string, valueAsNumber: number) => void;
}) => {
  const {
    name,
    formLabel,
    max = 100000,
    min = 0,
    step = 100,
    significantDigits = 5,
    isRequired = true,
    isDisabled = false,
    tooltip = {
      label: '',
      disabled: true,
      position: 'top',
    },
    onChange,
  } = props;

  const [isActive, setIsActive] = useState(false);

  const Control = (
    <FormControl
      isRequired={isRequired}
      isDisabled={isDisabled}
      id={formLabel}
      onFocus={() => {
        setIsActive(true);
      }}
      onBlur={() => {
        setIsActive(false);
      }}
    >
      {formLabel && <FormLabel>{formLabel}</FormLabel>}
      <>
        <NumberInput
          w="full"
          max={max}
          min={min}
          step={step}
          precision={2}
          isInvalid={props.isInvalid}
          keepWithinRange={!isActive}
          // clampValueOnBlur={true}
          title={`${formLabel} - ${name.toFixed(2)}`}
          value={
            isActive
              ? name || '0'
              : new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(+name || 0)
          }
          name={formLabel}
          onChange={onChange}
          pattern={
            // Currency format
            '^\\$?\\d{1,3}(,\\d{3})*\\.?\\d{0,2}$'
          }
        >
          <NumberInputField placeholder={formLabel} />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </>
    </FormControl>
  );

  return (
    <Tooltip
      label={tooltip.label}
      placement={tooltip.position}
      hasArrow
      isDisabled={tooltip.disabled}
    >
      {Control}
    </Tooltip>
  );
};

export default CurrencyInput;
