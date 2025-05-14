import React from 'react';
import {
  Box,
  Heading,
  VStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Input,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';

function TextOverlaySettings({
  textOverlay, setTextOverlay,
  fontSize, setFontSize,
  fontStyle, setFontStyle, fontStyleOptions,
  textColor, setTextColor,
  textBgColor, setTextBgColor,
  textPosition, setTextPosition,
}) {
  const settingsBoxBg = useColorModeValue('white', 'gray.750');
  const settingsHeadingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const labelColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg" shadow="md" bg={settingsBoxBg} id="text-overlay-section">
      <Heading as="h4" size="md" mb={5} color={settingsHeadingColor}>Text Overlay</Heading>
      <VStack spacing={5} align="stretch">
        <FormControl>
          <FormLabel htmlFor="textOverlay" color={labelColor}>Text</FormLabel>
          <Input id="textOverlay" placeholder="Enter text to overlay" value={textOverlay} onChange={(e) => setTextOverlay(e.target.value)} focusBorderColor="blue.500" />
        </FormControl>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl>
            <FormLabel htmlFor="fontSize" color={labelColor}>Font Size</FormLabel>
            <NumberInput
              id="fontSize"
              value={fontSize}
              min={8}
              max={100}
              onChange={(valueString, valueNumber) => {
                if (!isNaN(valueNumber)) setFontSize(valueNumber);
              }}
              focusBorderColor="blue.500"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="fontStyle" color={labelColor}>Font Style</FormLabel>
            <Select id="fontStyle" value={fontStyle} onChange={(e) => setFontStyle(e.target.value)} focusBorderColor="blue.500">
              {fontStyleOptions.map((font) => (<option key={font} value={font}>{font}</option>))}
            </Select>
          </FormControl>
        </SimpleGrid>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl>
            <FormLabel htmlFor="textColor" color={labelColor}>Text Color</FormLabel>
            <Input id="textColor" type="text" placeholder="e.g., white or #FFFFFF" value={textColor} onChange={(e) => setTextColor(e.target.value)} focusBorderColor="blue.500" />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="textBgColor" color={labelColor}>BG Color (opt.)</FormLabel>
            <Input id="textBgColor" type="text" placeholder="e.g., black or #00000080" value={textBgColor} onChange={(e) => setTextBgColor(e.target.value)} focusBorderColor="blue.500" />
          </FormControl>
        </SimpleGrid>
        <FormControl>
          <FormLabel htmlFor="textPosition" color={labelColor}>Position</FormLabel>
          <Select id="textPosition" value={textPosition} onChange={(e) => setTextPosition(e.target.value)} focusBorderColor="blue.500">
            <option value="center">Center</option>
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-right">Bottom Right</option>
          </Select>
        </FormControl>
      </VStack>
    </Box>
  );
}

export default TextOverlaySettings;