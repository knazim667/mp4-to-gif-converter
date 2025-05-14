import React, { useState, useEffect } from 'react';
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
  FormErrorMessage,
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
  const [textError, setTextError] = useState('');
  const [textColorError, setTextColorError] = useState('');
  const [textBgColorError, setTextBgColorError] = useState('');

  const MAX_TEXT_LENGTH = 100; // Example limit

  useEffect(() => {
    if (textOverlay && textOverlay.length > MAX_TEXT_LENGTH) {
      setTextError(`Text cannot exceed ${MAX_TEXT_LENGTH} characters.`);
    } else {
      setTextError('');
    }
  }, [textOverlay]);

  // Basic color validation (e.g., not too long)
  // Robust color validation is complex and often best left to the backend/rendering engine.
  const validateColorInput = (colorValue, setErrorFunc, fieldName) => {
    if (colorValue && colorValue.length > 50) { // Increased arbitrary length limit
      setErrorFunc(`${fieldName} value seems too long. Use common color names or hex codes (e.g., #RRGGBB, #RGB).`);
    } else {
      setErrorFunc('');
    }
  };

  useEffect(() => {
    validateColorInput(textColor, setTextColorError, 'Text color');
  }, [textColor]);

  useEffect(() => {
    // Background color is optional, so only validate if not empty
    if (textBgColor) {
      validateColorInput(textBgColor, setTextBgColorError, 'Background color');
    } else {
      setTextBgColorError(''); // Clear error if field is empty
    }
  }, [textBgColor]);

  return (
    <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg" shadow="md" bg={settingsBoxBg} id="text-overlay-section">
      <Heading as="h4" size="md" mb={5} color={settingsHeadingColor}>Text Overlay</Heading>
      <VStack spacing={5} align="stretch">
        <FormControl isInvalid={!!textError}>
          <FormLabel htmlFor="textOverlay" color={labelColor}>Text</FormLabel>
          <Input 
            id="textOverlay" 
            placeholder="Enter text to overlay" 
            value={textOverlay} 
            onChange={(e) => setTextOverlay(e.target.value)} 
            focusBorderColor="blue.500" 
          />
          {textError && <FormErrorMessage>{textError}</FormErrorMessage>}
        </FormControl>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl>
            <FormLabel htmlFor="fontSize" color={labelColor}>Font Size</FormLabel>
            <NumberInput 
              id="fontSize" 
              value={fontSize} 
              min={8} max={100} 
              onChange={(valueString, valueAsNumber) => setFontSize(valueAsNumber)} 
              focusBorderColor="blue.500"
              allowMouseWheel
            >
              <NumberInputField />
              <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
            </NumberInput>
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="fontStyle" color={labelColor}>Font Style</FormLabel>
            <Select 
              id="fontStyle" 
              value={fontStyle} 
              onChange={(e) => setFontStyle(e.target.value)} 
              focusBorderColor="blue.500"
            >
              {fontStyleOptions.map((font) => (<option key={font} value={font}>{font}</option>))}
            </Select>
          </FormControl>
        </SimpleGrid>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl isInvalid={!!textColorError}>
            <FormLabel htmlFor="textColor" color={labelColor}>Text Color</FormLabel>
            <Input 
              id="textColor" 
              type="text" 
              placeholder="e.g., white or #FFFFFF" 
              value={textColor} 
              onChange={(e) => setTextColor(e.target.value)} 
              focusBorderColor="blue.500" 
            />
            {textColorError && <FormErrorMessage>{textColorError}</FormErrorMessage>}
          </FormControl>
          <FormControl isInvalid={!!textBgColorError}>
            <FormLabel htmlFor="textBgColor" color={labelColor}>BG Color (opt.)</FormLabel>
            <Input 
              id="textBgColor" 
              type="text" 
              placeholder="e.g., black or #00000080" 
              value={textBgColor} 
              onChange={(e) => setTextBgColor(e.target.value)} 
              focusBorderColor="blue.500" 
            />
            {textBgColorError && <FormErrorMessage>{textBgColorError}</FormErrorMessage>}
          </FormControl>
        </SimpleGrid>
        <FormControl>
          <FormLabel htmlFor="textPosition" color={labelColor}>Position</FormLabel>
          <Select 
            id="textPosition" 
            value={textPosition} 
            onChange={(e) => setTextPosition(e.target.value)} 
            focusBorderColor="blue.500"
          >
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
