import { useState } from 'react';

import {
  FormControl,
  FormLabel,
  InputGroup,
  InputRightAddon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from '@chakra-ui/react';

export function PercentageInput(props: {
  name: number;
  max?: number;
  min?: number;
  significantDigits?: number;
  isRequired?: boolean;
  formLabel?: string;
  onChange: (valueAsString: string, valueAsNumber: number) => void;
}) {
  const {
    name,
    formLabel,
    max = 100,
    min = 0,
    significantDigits = 4,
    isRequired = true,
  } = props;

  const [isActive, setIsActive] = useState(false);

  return (
    <FormControl
      isRequired={isRequired}
      onFocus={() => {
        setIsActive(true);
      }}
      onBlur={() => {
        setIsActive(false);
      }}
    >
      {formLabel && <FormLabel>{formLabel}</FormLabel>}
      <NumberInput
        allowMouseWheel
        w="full"
        max={max}
        min={min}
        step={0.1}
        keepWithinRange={true}
        clampValueOnBlur={true}
        title={`${formLabel} - ${name.toFixed(2)}`}
        value={
          isActive
            ? name.toString().includes('.')
              ? name
              : name.toFixed(2)
            : new Intl.NumberFormat('en-US', {
                style: 'percent',
                maximumSignificantDigits: significantDigits,
                minimumFractionDigits: 2,
              }).format(+name / 100 || 0)
        }
        name={formLabel}
        onChange={props.onChange}
        // prevent the prompt to match the format xx.x%
        pattern="^\d{1,3}(,?\d{3})?(\.\d\d?)?%?$"
      >
        <NumberInputField placeholder={formLabel} />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
  );
}
