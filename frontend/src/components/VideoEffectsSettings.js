import React, { useState } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  FormErrorMessage, // For displaying error messages
  useColorModeValue,
} from '@chakra-ui/react';

function VideoEffectsSettings({
  speedFactor, setSpeedFactor,
  reverse, setReverse,
}) {
  const settingsBoxBg = useColorModeValue('white', 'gray.750');
  const settingsHeadingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const [speedFactorError, setSpeedFactorError] = useState('');

  const handleSpeedFactorChange = (valueAsString, valueAsNumber) => {
    const newSpeed = parseFloat(valueAsNumber);
    if (isNaN(newSpeed)) {
      setSpeedFactor(1.0); // Default to 1.0 if input is invalid
      setSpeedFactorError('Please enter a valid number.');
      return;
    }
    if (newSpeed < 0.1 || newSpeed > 5.0) {
      setSpeedFactorError('Speed must be between 0.1 and 5.0.');
      // Optionally clamp or allow temporary invalid state for user to correct
      // For now, we let NumberInput clamp, but error shows intent
    } else {
      setSpeedFactorError('');
    }
    setSpeedFactor(newSpeed); // NumberInput will clamp, but we set what was attempted
  };

  return (
    <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg" shadow="md" bg={settingsBoxBg} id="effects-section">
      <Heading as="h4" size="md" mb={5} color={settingsHeadingColor}>Video Effects</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} alignItems="center">
        <FormControl isInvalid={!!speedFactorError}>
          <FormLabel htmlFor="speedFactor" color={labelColor}>Speed Factor</FormLabel>
          <NumberInput id="speedFactor" value={speedFactor} min={0.1} max={5.0} step={0.1} precision={1} onChange={handleSpeedFactorChange} focusBorderColor="blue.500">
            <NumberInputField />
            <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
          </NumberInput>
          {speedFactorError && <FormErrorMessage>{speedFactorError}</FormErrorMessage>}
        </FormControl>
        <FormControl display="flex" alignItems="center" pt={{ md: "32px" }}>
          <Checkbox id="reverseCheckbox" isChecked={reverse} onChange={(e) => setReverse(e.target.checked)} size="lg" colorScheme="orange">
            Reverse Video
          </Checkbox>
        </FormControl>
      </SimpleGrid>
    </Box>
  );
}

export default VideoEffectsSettings;