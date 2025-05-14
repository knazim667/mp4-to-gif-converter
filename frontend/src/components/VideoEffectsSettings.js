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

function VideoEffectsSettings({
  speedFactor, setSpeedFactor,
  reverse, setReverse,
}) {
  const settingsBoxBg = useColorModeValue('white', 'gray.750');
  const settingsHeadingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const labelColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg" shadow="md" bg={settingsBoxBg} id="effects-section">
      <Heading as="h4" size="md" mb={5} color={settingsHeadingColor}>Video Effects</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} alignItems="center">
        <FormControl>
          <FormLabel htmlFor="speedFactor" color={labelColor}>Speed Factor</FormLabel>
          <NumberInput id="speedFactor" value={speedFactor} min={0.1} max={5.0} step={0.1} precision={1} onChange={(vS, vN) => setSpeedFactor(parseFloat(vN) || 1.0)} focusBorderColor="blue.500">
            <NumberInputField />
            <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
          </NumberInput>
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