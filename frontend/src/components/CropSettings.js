import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Button,
  Text,
  FormErrorMessage,
  useColorModeValue,
} from '@chakra-ui/react';

function CropSettings({
  showVisualCropper,
  setShowVisualCropper,
  videoSrc,
  videoPreviewDimensions,
  isProcessing,
  cropX, setCropX,
  cropY, setCropY,
  cropW, setCropW,
  cropH, setCropH,
}) {
  const settingsBoxBg = useColorModeValue('white', 'gray.750');
  const settingsHeadingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const labelColor = useColorModeValue('gray.600', 'gray.400');

  const [errors, setErrors] = useState({
    x: '',
    y: '',
    w: '',
    h: '',
  });

  const naturalWidth = videoPreviewDimensions?.naturalWidth || 0;
  const naturalHeight = videoPreviewDimensions?.naturalHeight || 0;

  // Validation logic
  useEffect(() => {
    const newErrors = { x: '', y: '', w: '', h: '' };
    // It's important that crop values are numbers for these comparisons,
    // or null if not yet set.
    const currentCropX = cropX === null ? null : Number(cropX);
    const currentCropY = cropY === null ? null : Number(cropY);
    const currentCropW = cropW === null ? null : Number(cropW);
    const currentCropH = cropH === null ? null : Number(cropH);


    // Validate Width
    if (currentCropW !== null && currentCropW <= 0) {
      newErrors.w = 'Width must be positive.';
    } else if (currentCropW !== null && naturalWidth > 0 && currentCropW > naturalWidth) {
      newErrors.w = `Width cannot exceed video width (${naturalWidth}px).`;
    }

    // Validate Height
    if (currentCropH !== null && currentCropH <= 0) {
      newErrors.h = 'Height must be positive.';
    } else if (currentCropH !== null && naturalHeight > 0 && currentCropH > naturalHeight) {
      newErrors.h = `Height cannot exceed video height (${naturalHeight}px).`;
    }

    // Validate X
    if (currentCropX !== null && currentCropX < 0) {
      newErrors.x = 'X offset cannot be negative.';
    } else if (currentCropX !== null && currentCropW !== null && currentCropW > 0 && naturalWidth > 0 && (currentCropX + currentCropW) > naturalWidth) {
      if (newErrors.w === '') { // Only show this if width itself is not the primary issue
        newErrors.x = `X + Width exceeds video width (${naturalWidth}px).`;
      }
    }

    // Validate Y
    if (currentCropY !== null && currentCropY < 0) {
      newErrors.y = 'Y offset cannot be negative.';
    } else if (currentCropY !== null && currentCropH !== null && currentCropH > 0 && naturalHeight > 0 && (currentCropY + currentCropH) > naturalHeight) {
       if (newErrors.h === '') { // Only show this if height itself is not the primary issue
        newErrors.y = `Y + Height exceeds video height (${naturalHeight}px).`;
      }
    }

    setErrors(newErrors);

  }, [cropX, cropY, cropW, cropH, naturalWidth, naturalHeight]);


  return (
    <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg" shadow="md" bg={settingsBoxBg} id="crop-section">
      <Heading as="h4" size="md" mb={5} color={settingsHeadingColor}>Crop Video (Optional)</Heading>
      <Button
        onClick={() => setShowVisualCropper(!showVisualCropper)}
        colorScheme={showVisualCropper ? "orange" : "blue"}
        mb={4}
        isDisabled={!videoSrc || videoPreviewDimensions.naturalWidth === 0 || isProcessing}
      >
        {showVisualCropper ? "Hide Visual Cropper & Use Numerical Inputs" : "Visually Select Crop Area"}
      </Button>
      {!showVisualCropper && (
        <Text fontSize="sm" color={labelColor} mb={4}>
          Specify crop numerically. Values are in pixels relative to original video.
        </Text>)}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
        <FormControl isInvalid={!!errors.x}>
          <FormLabel htmlFor="cropX" color={labelColor}>X</FormLabel>
          <NumberInput 
            id="cropX" 
            value={cropX ?? ''} 
            min={0} 
            onChange={(valueString, valueAsNumber) => setCropX(valueString === '' ? null : valueAsNumber)} 
            placeholder="0" 
            focusBorderColor="blue.500"
            allowMouseWheel
          >
            <NumberInputField />
          </NumberInput>
          {errors.x && <FormErrorMessage>{errors.x}</FormErrorMessage>}
        </FormControl>
        <FormControl isInvalid={!!errors.y}>
          <FormLabel htmlFor="cropY" color={labelColor}>Y</FormLabel>
          <NumberInput 
            id="cropY" 
            value={cropY ?? ''} 
            min={0} 
            onChange={(valueString, valueAsNumber) => setCropY(valueString === '' ? null : valueAsNumber)} 
            placeholder="0" 
            focusBorderColor="blue.500"
            allowMouseWheel
          >
            <NumberInputField />
          </NumberInput>
          {errors.y && <FormErrorMessage>{errors.y}</FormErrorMessage>}
        </FormControl>
        <FormControl isInvalid={!!errors.w}>
          <FormLabel htmlFor="cropW" color={labelColor}>Width</FormLabel>
          <NumberInput 
            id="cropW" 
            value={cropW ?? ''} 
            min={1} // Width should be at least 1
            onChange={(valueString, valueAsNumber) => setCropW(valueString === '' ? null : valueAsNumber)} 
            placeholder="e.g., 640" 
            focusBorderColor="blue.500"
            allowMouseWheel
          >
            <NumberInputField />
          </NumberInput>
          {errors.w && <FormErrorMessage>{errors.w}</FormErrorMessage>}
        </FormControl>
        <FormControl isInvalid={!!errors.h}>
          <FormLabel htmlFor="cropH" color={labelColor}>Height</FormLabel>
          <NumberInput 
            id="cropH" 
            value={cropH ?? ''} 
            min={1} // Height should be at least 1
            onChange={(valueString, valueAsNumber) => setCropH(valueString === '' ? null : valueAsNumber)} 
            placeholder="e.g., 480" 
            focusBorderColor="blue.500"
            allowMouseWheel
          >
            <NumberInputField />
          </NumberInput>
          {errors.h && <FormErrorMessage>{errors.h}</FormErrorMessage>}
        </FormControl>
      </SimpleGrid>
    </Box>
  );
}

export default CropSettings;
