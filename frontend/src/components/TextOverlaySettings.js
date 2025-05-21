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
  // console.log('TextOverlaySettings received setTextBgColor:', typeof setTextBgColor, setTextBgColor); // Keep or remove after debugging

  const settingsBoxBg = useColorModeValue('white', 'gray.750');
  const settingsHeadingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const [textError, setTextError] = useState('');
  const [textColorError, setTextColorError] = useState('');
  const [textBgColorError, setTextBgColorError] = useState('');

  const MAX_TEXT_LENGTH = 100; // Example limit

  // Validate Text Length
  useEffect(() => {
    if (textOverlay && textOverlay.length > MAX_TEXT_LENGTH) {
      setTextError(`Text cannot exceed ${MAX_TEXT_LENGTH} characters.`);
    } else {
      setTextError('');
    }
  }, [textOverlay]);

  // Enhanced color validation utility
  const validateColorInput = (colorValue, setErrorFunc, fieldName) => {
    const trimmedColorValue = colorValue ? colorValue.trim() : '';

    if (trimmedColorValue === '') { // Empty is fine for optional fields
      setErrorFunc('');
      return;
    }

    // More robust regex for common CSS color formats:
    // Named colors (basic lowercase check)
    // #RGB, #RRGGBB, #RRGGBBAA
    // rgb(r,g,b), rgba(r,g,b,a) - basic structure, not full value range check
    // hsl(h,s,l), hsla(h,s,l,a) - basic structure
    const colorPattern = new RegExp(
        '^(' +
        '#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?([0-9a-fA-F]{2})?\\b' + // Hex
        '|[a-z]+' + // Named colors (basic)
        '|rgb\\(\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*\\)' + // rgb()
        '|rgba\\(\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*,\\s*(?:\\d?\\.\\d+|\\d)\\s*\\)' + // rgba()
        '|hsl\\(\\s*\\d{1,3}\\s*,\\s*\\d{1,3}%\\s*,\\s*\\d{1,3}%\\s*\\)' + // hsl() - simple percentage check
        '|hsla\\(\\s*\\d{1,3}\\s*,\\s*\\d{1,3}%\\s*,\\s*\\d{1,3}%\\s*,\\s*(?:\\d?\\.\\d+|\\d)\\s*\\)' + // hsla() - simple percentage check
        ')$'
        , 'i' // Case-insensitive
    );


    if (!colorPattern.test(trimmedColorValue)) {
      setErrorFunc(`Invalid ${fieldName}. Use names (e.g., red), hex (#FFF, #FF0000), rgb(), rgba(), hsl(), or hsla().`);
    } else if (trimmedColorValue.length > 100) { // Keep a general length check
       setErrorFunc(`${fieldName} value seems excessively long.`);
    }
     else {
      setErrorFunc(''); // Clear error if valid
    }
  };

  // Validate Text Color
  useEffect(() => {
    // Text color is required, so validate even if empty initially
    if (!textColor || textColor.trim() === '') {
        // Decide if empty color is an error or defaults to white (current behavior)
        // If white is the default, maybe an empty string shouldn't be an error here?
        // Let's add a check based on your current default logic (white)
         if (textColor.trim() === '') {
             setTextColorError(''); // No error for empty if default is handled elsewhere
         } else {
             validateColorInput(textColor, setTextColorError, 'Text color');
         }

    } else {
        validateColorInput(textColor, setTextColorError, 'Text color');
    }
  }, [textColor]);

  // Validate Background Color
  useEffect(() => {
    // Background color is optional, so only validate if not empty
    if (textBgColor) {
      validateColorInput(textBgColor, setTextBgColorError, 'Background color');
    } else {
      setTextBgColorError(''); // Clear error if field is empty
    }
  }, [textBgColor]);

    // Handle font size change with validation (NumberInput has built-in min/max)
  const handleFontSizeChange = (valueAsString, valueAsNumber) => {
      // Allow clearing the input
      if (valueAsString === '') {
          setFontSize(20); // Or null
           return;
      }
       // NumberInput handles min/max clamping and ensures it's a number
       setFontSize(valueAsNumber); // Update parent state
  }


  return (
    <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg" shadow="md" bg={settingsBoxBg} id="text-overlay-section">
      <Heading as="h4" size={{ base: 'sm', md: 'md' }} mb={5} color={settingsHeadingColor}>Text Overlay (Optional)</Heading>
      <VStack spacing={5} align="stretch">
        <FormControl isInvalid={!!textError}>
          <FormLabel htmlFor="textOverlay" color={labelColor}>Text</FormLabel>
          <Input
            id="textOverlay"
            placeholder="Enter text to overlay"
            value={textOverlay}
            onChange={(e) => setTextOverlay(e.target.value)}
            focusBorderColor="blue.500"
            maxLength={MAX_TEXT_LENGTH} // Enforce max length in input
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
              onChange={handleFontSizeChange} // Use dedicated handler
              focusBorderColor="blue.500"
              allowMouseWheel
            >
              <NumberInputField />
              <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
            </NumberInput>
             {/* Add a form error message if needed based on handler logic */}
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="fontStyle" color={labelColor}>Font Style</FormLabel>
            <Select
              id="fontStyle"
              value={fontStyle}
              onChange={(e) => setFontStyle(e.target.value)}
              focusBorderColor="blue.500"
            >
               {/* Add a default empty option if changing font style is optional */}
               {/* <option value="">-- Select Font --</option> */}
              {(fontStyleOptions || []).map((font) => (<option key={font} value={font}>{font}</option>))} {/* Ensure fontStyleOptions is an array */}
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