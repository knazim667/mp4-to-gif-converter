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

  // Use default 0 if dimensions are not yet available
  const naturalWidth = videoPreviewDimensions?.naturalWidth || 0;
  const naturalHeight = videoPreviewDimensions?.naturalHeight || 0;

  // Validation logic for numerical inputs
  useEffect(() => {
    const newErrors = { x: '', y: '', w: '', h: '' };
    // It's important that crop values are numbers for these comparisons,
    // or null if not yet set. Handle empty strings from NumberInput field
    const currentCropX = cropX === null || cropX === '' ? null : Number(cropX);
    const currentCropY = cropY === null || cropY === '' ? null : Number(cropY);
    const currentCropW = cropW === null || cropW === '' ? null : Number(cropW);
    const currentCropH = cropH === null || cropH === '' ? null : Number(cropH);

    // Only validate if natural dimensions are available
    if (naturalWidth > 0 && naturalHeight > 0) {

        // Validate Width
        if (currentCropW !== null) {
            if (isNaN(currentCropW) || currentCropW <= 0) {
              newErrors.w = 'Width must be a positive number.';
            } else if (currentCropW > naturalWidth) {
              newErrors.w = `Width cannot exceed video width (${naturalWidth}px).`;
            }
        }


        // Validate Height
        if (currentCropH !== null) {
             if (isNaN(currentCropH) || currentCropH <= 0) {
              newErrors.h = 'Height must be a positive number.';
            } else if (currentCropH > naturalHeight) {
              newErrors.h = `Height cannot exceed video height (${naturalHeight}px).`;
            }
        }

        // Validate X offset
        if (currentCropX !== null) {
            if (isNaN(currentCropX) || currentCropX < 0) {
              newErrors.x = 'X offset must be a non-negative number.';
            } else if (currentCropW !== null && !isNaN(currentCropW) && currentCropW > 0 && (currentCropX + currentCropW) > naturalWidth) {
              if (newErrors.w === '') { // Only show this if width itself is not the primary issue
                 // Check if the calculated total width exceeds natural width, considering valid inputs
                if (currentCropX >= 0 && currentCropW > 0 && (currentCropX + currentCropW) > naturalWidth + 0.5) { // Add tolerance for floating point
                     newErrors.x = `X + Width exceeds video width (${naturalWidth}px).`;
                }
              }
            }
        }


        // Validate Y offset
        if (currentCropY !== null) {
             if (isNaN(currentCropY) || currentCropY < 0) {
              newErrors.y = 'Y offset must be a non-negative number.';
            } else if (currentCropH !== null && !isNaN(currentCropH) && currentCropH > 0 && (currentCropY + currentCropH) > naturalHeight) {
               if (newErrors.h === '') { // Only show this if height itself is not the primary issue
                 // Check if the calculated total height exceeds natural height, considering valid inputs
                 if (currentCropY >= 0 && currentCropH > 0 && (currentCropY + currentCropH) > naturalHeight + 0.5) { // Add tolerance for floating point
                    newErrors.y = `Y + Height exceeds video height (${naturalHeight}px).`;
                 }
              }
            }
        }
    } else {
        // Clear errors if dimensions are not available (settings should be disabled anyway)
        newErrors.x = ''; newErrors.y = ''; newErrors.w = ''; newErrors.h = '';
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
      {!showVisualCropper && ( // Only show numerical inputs if visual cropper is hidden
        <>
          <Text fontSize="sm" color={labelColor} mb={4}>
            Specify crop numerically. Values are in pixels relative to original video.
             {naturalWidth > 0 && naturalHeight > 0 && (
                 <Text as="span" fontWeight="semibold"> Video dimensions: {naturalWidth}x{naturalHeight}px.</Text>
             )}
             {!naturalWidth || !naturalHeight && (
                  <Text as="span" fontStyle="italic"> (Video dimensions not available)</Text>
             )}
          </Text>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            <FormControl isInvalid={!!errors.x}>
              <FormLabel htmlFor="cropX" color={labelColor}>X</FormLabel>
              <NumberInput
                id="cropX"
                value={cropX ?? ''} // Use ?? '' to display empty string for null
                min={0}
                 max={naturalWidth > 0 ? naturalWidth - (Number(cropW) > 0 ? Number(cropW) : 0) : undefined} // Dynamic max based on width
                onChange={(valueString, valueAsNumber) => setCropX(valueString === '' ? null : valueAsNumber)}
                placeholder="0"
                focusBorderColor="blue.500"
                allowMouseWheel
                 isDisabled={!naturalWidth || !naturalHeight || isProcessing} // Disable if no video or processing
              >
                <NumberInputField />
              </NumberInput>
              {errors.x && <FormErrorMessage>{errors.x}</FormErrorMessage>}
            </FormControl>
            <FormControl isInvalid={!!errors.y}>
              <FormLabel htmlFor="cropY" color={labelColor}>Y</FormLabel>
              <NumberInput
                id="cropY"
                value={cropY ?? ''} // Use ?? '' to display empty string for null
                min={0}
                 max={naturalHeight > 0 ? naturalHeight - (Number(cropH) > 0 ? Number(cropH) : 0) : undefined} // Dynamic max based on height
                onChange={(valueString, valueAsNumber) => setCropY(valueString === '' ? null : valueAsNumber)}
                placeholder="0"
                focusBorderColor="blue.500"
                allowMouseWheel
                 isDisabled={!naturalWidth || !naturalHeight || isProcessing} // Disable if no video or processing
              >
                <NumberInputField />
              </NumberInput>
              {errors.y && <FormErrorMessage>{errors.y}</FormErrorMessage>}
            </FormControl>
            <FormControl isInvalid={!!errors.w}>
              <FormLabel htmlFor="cropW" color={labelColor}>Width</FormLabel>
              <NumberInput
                id="cropW"
                value={cropW ?? ''} // Use ?? '' to display empty string for null
                min={1} // Width should be at least 1
                 max={naturalWidth > 0 ? naturalWidth - (Number(cropX) > 0 ? Number(cropX) : 0) : undefined} // Dynamic max based on X
                onChange={(valueString, valueAsNumber) => setCropW(valueString === '' ? null : valueAsNumber)}
                placeholder="e.g., 640"
                focusBorderColor="blue.500"
                allowMouseWheel
                 isDisabled={!naturalWidth || !naturalHeight || isProcessing} // Disable if no video or processing
              >
                <NumberInputField />
              </NumberInput>
              {errors.w && <FormErrorMessage>{errors.w}</FormErrorMessage>}
            </FormControl>
            <FormControl isInvalid={!!errors.h}>
              <FormLabel htmlFor="cropH" color={labelColor}>Height</FormLabel>
              <NumberInput
                id="cropH"
                value={cropH ?? ''} // Use ?? '' to display empty string for null
                min={1} // Height should be at least 1
                 max={naturalHeight > 0 ? naturalHeight - (Number(cropY) > 0 ? Number(cropY) : 0) : undefined} // Dynamic max based on Y
                onChange={(valueString, valueAsNumber) => setCropH(valueString === '' ? null : valueAsNumber)}
                placeholder="e.g., 480"
                focusBorderColor="blue.500"
                allowMouseWheel
                 isDisabled={!naturalWidth || !naturalHeight || isProcessing} // Disable if no video or processing
              >
                <NumberInputField />
              </NumberInput>
              {errors.h && <FormErrorMessage>{errors.h}</FormErrorMessage>}
            </FormControl>
          </SimpleGrid>
        </>
      )}

    </Box>
  );
}

export default CropSettings;