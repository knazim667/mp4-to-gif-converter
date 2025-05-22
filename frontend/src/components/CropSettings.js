import React, { useState, useEffect, useRef } from 'react';
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
  Select, // Added Select
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

  const aspectRatios = [
    { name: 'Custom', value: 'custom' },
    { name: 'Original Video', value: 'original' },
    { name: '16:9 (Widescreen)', value: (16 / 9).toString() },
    { name: '4:3 (Standard TV)', value: (4 / 3).toString() },
    { name: '1:1 (Square)', value: (1 / 1).toString() },
    { name: '3:2 (Photography)', value: (3 / 2).toString() },
    { name: '2:3 (Portrait)', value: (2 / 3).toString() },
    { name: '9:16 (Tall Portrait)', value: (9 / 16).toString() },
  ];

  const [selectedAspectRatioKey, setSelectedAspectRatioKey] = useState('custom');
  const lastEditedDimension = useRef(null); // To manage linked input updates

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

  // Effect to apply aspect ratio when cropW is changed by user while AR is active
  useEffect(() => {
    if (selectedAspectRatioKey === 'custom' || selectedAspectRatioKey === 'original' || lastEditedDimension.current === 'height') {
      if (lastEditedDimension.current === 'height') lastEditedDimension.current = null; // Reset if height was the source
      return;
    }
    const ratio = parseFloat(selectedAspectRatioKey);
    if (cropW !== null && !isNaN(cropW) && cropW > 0 && !isNaN(ratio) && ratio > 0 && naturalHeight > 0) {
      const newH = Math.round(cropW / ratio);
      const clampedH = Math.max(1, Math.min(newH, naturalHeight - (cropY || 0)));
      if (clampedH !== cropH) {
        lastEditedDimension.current = 'width'; // Mark width as the source
        setCropH(clampedH);
      }
    }
  }, [cropW, selectedAspectRatioKey, cropY, naturalHeight, setCropH, cropH]); // Added cropH to deps for re-evaluation if it was out of sync

  // Effect to apply aspect ratio when cropH is changed by user while AR is active
  useEffect(() => {
    if (selectedAspectRatioKey === 'custom' || selectedAspectRatioKey === 'original' || lastEditedDimension.current === 'width') {
      if (lastEditedDimension.current === 'width') lastEditedDimension.current = null; // Reset if width was the source
      return;
    }
    const ratio = parseFloat(selectedAspectRatioKey);
    if (cropH !== null && !isNaN(cropH) && cropH > 0 && !isNaN(ratio) && ratio > 0 && naturalWidth > 0) {
      const newW = Math.round(cropH * ratio);
      const clampedW = Math.max(1, Math.min(newW, naturalWidth - (cropX || 0)));
      if (clampedW !== cropW) {
        lastEditedDimension.current = 'height'; // Mark height as the source
        setCropW(clampedW);
      }
    }
  }, [cropH, selectedAspectRatioKey, cropX, naturalWidth, setCropW, cropW]); // Added cropW to deps


  const handleAspectRatioChange = (event) => {
    const newKey = event.target.value;
    setSelectedAspectRatioKey(newKey);
    lastEditedDimension.current = null; // Reset when user picks a new AR from dropdown

    if (newKey === 'custom' || naturalWidth <= 0 || naturalHeight <= 0) {
      return;
    }

    let currentX = cropX === null ? 0 : Number(cropX);
    let currentY = cropY === null ? 0 : Number(cropY);
    let currentW = cropW === null ? naturalWidth : Number(cropW);
    let currentH = cropH === null ? naturalHeight : Number(cropH);

    if (newKey === 'original') {
      setCropX(0);
      setCropY(0);
      setCropW(naturalWidth);
      setCropH(naturalHeight);
      return;
    }

    const ratio = parseFloat(newKey);
    if (isNaN(ratio) || ratio <= 0) return;

    // Attempt to maintain current width and adjust height, then fit and center
    let targetW = currentW > 0 ? currentW : naturalWidth * 0.8; // Use current width or 80% of video width
    let targetH = Math.round(targetW / ratio);

    // If calculated height exceeds video bounds, recalculate based on video height
    if (targetH > naturalHeight) {
      targetH = naturalHeight;
      targetW = Math.round(targetH * ratio);
    }
    // If calculated width (after potential height adjustment) exceeds video bounds
    if (targetW > naturalWidth) {
      targetW = naturalWidth;
      targetH = Math.round(targetW / ratio);
    }

    // Ensure minimum dimensions
    targetW = Math.max(10, targetW);
    targetH = Math.max(10, targetH);

    // Center the new crop box
    let finalX = Math.round(Math.max(0, currentX + (currentW - targetW) / 2));
    let finalY = Math.round(Math.max(0, currentY + (currentH - targetH) / 2));
    
    // Ensure the new crop box is within video boundaries
    finalX = Math.min(finalX, naturalWidth - targetW);
    finalY = Math.min(finalY, naturalHeight - targetH);
    
    setCropX(finalX < 0 ? 0 : finalX);
    setCropY(finalY < 0 ? 0 : finalY);
    setCropW(targetW);
    setCropH(targetH);
  };


  return (
    <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg" shadow="md" bg={settingsBoxBg} id="crop-section">
      <Heading as="h4" size={{ base: 'sm', md: 'md' }} mb={5} color={settingsHeadingColor}>Crop Video (Optional)</Heading>
      
      <Button
        onClick={() => setShowVisualCropper(!showVisualCropper)}
        colorScheme={showVisualCropper ? "orange" : "blue"}
        mb={{ base: 3, md: 4 }}
        isDisabled={!videoSrc || videoPreviewDimensions.naturalWidth === 0 || isProcessing}
        w={{ base: 'full', md: 'auto' }}
      >
        {showVisualCropper ? "Hide Visual Cropper & Use Numerical Inputs" : "Visually Select Crop Area"}
      </Button>

      {!showVisualCropper && ( // Only show numerical inputs if visual cropper is hidden
        <>
          <FormControl mb={6} id="aspect-ratio-control">
            <FormLabel htmlFor="aspectRatioSelect" color={labelColor}>Aspect Ratio</FormLabel>
            <Select
              id="aspectRatioSelect"
              value={selectedAspectRatioKey}
              onChange={handleAspectRatioChange}
              focusBorderColor="blue.500"
              isDisabled={naturalWidth === 0 || naturalHeight === 0 || isProcessing}
            >
              {aspectRatios.map(ar => (
                <option key={ar.name} value={ar.value}>
                  {ar.name}
                </option>
              ))}
            </Select>
          </FormControl>
          <Text fontSize="sm" color={labelColor} mb={4}>
            Specify crop numerically. Values are in pixels relative to original video.
             {(naturalWidth > 0 && naturalHeight > 0) && (
                 <Text as="span" fontWeight="semibold"> Video dimensions: {naturalWidth}x{naturalHeight}px.</Text>
             )}
             {!naturalWidth || !naturalHeight && (
                  <Text as="span" fontStyle="italic"> (Video dimensions not available)</Text>
             )}
          </Text>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            <FormControl isInvalid={!!errors.x} id={`cropX-control`}>
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
            <FormControl isInvalid={!!errors.y} id={`cropY-control`}>
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
            <FormControl isInvalid={!!errors.w} id={`cropW-control`}>
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
            <FormControl isInvalid={!!errors.h} id={`cropH-control`}>
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