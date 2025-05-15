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
  FormErrorMessage,
  useColorModeValue,
} from '@chakra-ui/react';

function OutputOptionsSettings({
  fps,
  setFps,
  width,
  setWidth,
  includeAudio,
  setIncludeAudio,
}) {
  const settingsBoxBg = useColorModeValue('white', 'gray.750');
  const settingsHeadingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const labelColor = useColorModeValue('gray.600', 'gray.400');

  const [fpsError, setFpsError] = useState('');
  const [widthError, setWidthError] = useState('');

  const handleFpsChange = (valueAsString, valueAsNumber) => {
    // Allow clearing the input
    if (valueAsString === '') {
      setFps(10); // Or null, depending on desired behavior for empty input
      setFpsError('');
      return;
    }
    const newFps = parseInt(valueAsNumber, 10);
    if (isNaN(newFps)) {
      setFpsError('FPS must be a valid number.');
      // Don't update state with NaN, keep previous valid value or a default
      // setFps(10); // Option to reset to default on invalid input
      return; // Prevent updating parent state with invalid number
    }

    // NumberInput min/max will handle clamping, but display message for values outside practical range
    if (newFps < 1 || newFps > 60) {
      setFpsError('FPS is typically between 1 and 60.');
    } else {
      setFpsError('');
    }
    setFps(newFps); // Update parent state with the potentially clamped value
  };

  const handleWidthChange = (valueAsString, valueAsNumber) => {
    // Allow clearing the input
    if (valueAsString === '') {
      setWidth(320); // Or null
      setWidthError('');
      return;
    }
    const newWidth = parseInt(valueAsNumber, 10);
    if (isNaN(newWidth)) {
       setWidthError('Width must be a valid number.');
       // setWidth(320); // Option to reset to default
       return; // Prevent updating parent state with invalid number
    }

    if (newWidth < 50 || newWidth > 4096) {
      setWidthError('Width is typically between 50 and 4096 pixels.');
    } else {
      setWidthError('');
    }
     setWidth(newWidth); // Update parent state with the potentially clamped value
  };


  return (
    <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg" shadow="md" bg={settingsBoxBg} id="output-options-section">
      <Heading as="h4" size="md" mb={5} color={settingsHeadingColor}>Output Options</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <FormControl isInvalid={!!fpsError}>
          <FormLabel htmlFor="fps" color={labelColor}>FPS</FormLabel>
          <NumberInput
            id="fps"
            value={fps}
            min={1}
            max={60}
            onChange={handleFpsChange}
            focusBorderColor="blue.500"
            allowMouseWheel
             // Chakra UI NumberInput handles isDisabled based on parent FormControl's isDisabled
          >
            <NumberInputField />
            <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
          </NumberInput>
          {fpsError && <FormErrorMessage>{fpsError}</FormErrorMessage>}
        </FormControl>
        <FormControl isInvalid={!!widthError}>
          <FormLabel htmlFor="width" color={labelColor}>Output Width (px)</FormLabel>
          <NumberInput
            id="width"
            value={width}
            min={50}
            max={4096}
            step={10}
            onChange={handleWidthChange}
            focusBorderColor="blue.500"
            allowMouseWheel
             // Chakra UI NumberInput handles isDisabled based on parent FormControl's isDisabled
          >
            <NumberInputField />
            <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
          </NumberInput>
          {widthError && <FormErrorMessage>{widthError}</FormErrorMessage>}
        </FormControl>
      </SimpleGrid>
      <FormControl display="flex" alignItems="center" mt={8}>
        <Checkbox
          id="includeAudioCheckbox"
          isChecked={includeAudio}
          onChange={(e) => setIncludeAudio(e.target.checked)}
          size="lg"
          colorScheme="green"
           // Chakra UI Checkbox handles isDisabled prop directly
        >
          Include Audio (outputs as MP4)
        </Checkbox>
      </FormControl>
    </Box>
  );
}

export default OutputOptionsSettings;