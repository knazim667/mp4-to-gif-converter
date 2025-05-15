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
  FormErrorMessage, // Added for displaying error messages
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
    const newFps = parseInt(valueAsNumber, 10); // Ensure integer
    if (isNaN(newFps)) {
      setFps(10); // Default FPS if input is invalid
      setFpsError('FPS must be a valid number.');
      return;
    }
    if (newFps < 1 || newFps > 60) {
      setFpsError('FPS must be between 1 and 60.');
      // NumberInput will clamp, but error message provides feedback on attempted value
    } else {
      setFpsError('');
    }
    setFps(newFps); // Update parent state
  };

  const handleWidthChange = (valueAsString, valueAsNumber) => {
    const newWidth = parseInt(valueAsNumber, 10); // Ensure integer
    if (isNaN(newWidth)) {
      setWidth(320); // Default width if input is invalid
      setWidthError('Width must be a valid number.');
      return;
    }
    if (newWidth < 50 || newWidth > 4096) { // Practical limits for width
      setWidthError('Width must be between 50 and 4096 pixels.');
      // NumberInput will clamp if min/max are set, but error message provides feedback
    } else {
      setWidthError('');
    }
    setWidth(newWidth); // Update parent state
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
            min={50}  // Adjusted min for practical use
            max={4096} // Adjusted max for practical use
            step={10} 
            onChange={handleWidthChange} 
            focusBorderColor="blue.500"
            allowMouseWheel
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
        >
          Include Audio (outputs as MP4)
        </Checkbox>
      </FormControl>
    </Box>
  );
}

export default OutputOptionsSettings;
