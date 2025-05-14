import React from 'react';
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

  return (
    <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg" shadow="md" bg={settingsBoxBg} id="output-options-section">
      <Heading as="h4" size="md" mb={5} color={settingsHeadingColor}>Output Options</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <FormControl>
          <FormLabel htmlFor="fps" color={labelColor}>FPS</FormLabel>
          <NumberInput id="fps" value={fps} min={1} max={60} onChange={(valStr, valNum) => setFps(valNum)} focusBorderColor="blue.500">
            <NumberInputField />
            <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="width" color={labelColor}>Output Width (px)</FormLabel>
          <NumberInput id="width" value={width} min={100} max={1920} step={10} onChange={(valStr, valNum) => setWidth(valNum)} focusBorderColor="blue.500">
            <NumberInputField />
            <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
          </NumberInput>
        </FormControl>
      </SimpleGrid>
      <FormControl display="flex" alignItems="center" mt={8}>
        <Checkbox id="includeAudioCheckbox" isChecked={includeAudio} onChange={(e) => setIncludeAudio(e.target.checked)} size="lg" colorScheme="green">
          Include Audio (outputs as MP4)
        </Checkbox>
      </FormControl>
    </Box>
  );
}

export default OutputOptionsSettings;