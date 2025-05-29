// /Users/abbaskhan/Documents/mp4-to-gif-converter/frontend/src/components/CropSettings.js
import React, { useState, useEffect, useRef } from 'react';
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
  Button,
  Text,
  FormErrorMessage,
  Select,
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
  selectedAspectRatioKey, // Prop from parent
  setSelectedAspectRatioKey, // Prop from parent
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

  const MIN_CROP_DIMENSION = 10;

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

  // const [selectedAspectRatioKey, setSelectedAspectRatioKey] = useState('custom'); // Removed: Use prop from parent
  const lastEditedDimension = useRef(null); // To manage linked input updates when user types
  const isProgrammaticRatioChangeRef = useRef(false); // Flag for programmatic aspect ratio changes

  const naturalWidth = videoPreviewDimensions?.naturalWidth || 0;
  const naturalHeight = videoPreviewDimensions?.naturalHeight || 0;

  useEffect(() => {
    // console.log('[CropSettings.js] Props received:', { cropX, cropY, cropW, cropH, selectedAspectRatioKey, naturalWidth, naturalHeight });
  }, [cropX, cropY, cropW, cropH, selectedAspectRatioKey, naturalWidth, naturalHeight]);


  // Validation logic for numerical inputs
  useEffect(() => {
    const newErrors = { x: '', y: '', w: '', h: '' };
    const currentCropX = cropX === null || cropX === '' ? null : Number(cropX);
    const currentCropY = cropY === null || cropY === '' ? null : Number(cropY);
    const currentCropW = cropW === null || cropW === '' ? null : Number(cropW);
    const currentCropH = cropH === null || cropH === '' ? null : Number(cropH);

    if (naturalWidth > 0 && naturalHeight > 0) {
      if (currentCropW !== null) {
        if (isNaN(currentCropW) || currentCropW <= 0) {
          newErrors.w = 'Width must be a positive number.';
        } else if (currentCropW < MIN_CROP_DIMENSION) {
          newErrors.w = `Width must be at least ${MIN_CROP_DIMENSION}px.`;
        } else if (currentCropW > naturalWidth) {
          newErrors.w = `Width cannot exceed video width (${naturalWidth}px).`;
        }
      }

      if (currentCropH !== null) {
        if (isNaN(currentCropH) || currentCropH <= 0) {
          newErrors.h = 'Height must be a positive number.';
        } else if (currentCropH < MIN_CROP_DIMENSION) {
          newErrors.h = `Height must be at least ${MIN_CROP_DIMENSION}px.`;
        } else if (currentCropH > naturalHeight) {
          newErrors.h = `Height cannot exceed video height (${naturalHeight}px).`;
        }
      }

      if (currentCropX !== null) {
        if (isNaN(currentCropX) || currentCropX < 0) {
          newErrors.x = 'X offset must be a non-negative number.';
        } else if (currentCropW !== null && !isNaN(currentCropW) && currentCropW > 0 && (currentCropX + currentCropW) > naturalWidth + 0.5) { // Add tolerance
          if (newErrors.w === '') {
            newErrors.x = `X + Width exceeds video width (${naturalWidth}px).`;
          }
        }
      }

      if (currentCropY !== null) {
        if (isNaN(currentCropY) || currentCropY < 0) {
          newErrors.y = 'Y offset must be a non-negative number.';
        } else if (currentCropH !== null && !isNaN(currentCropH) && currentCropH > 0 && (currentCropY + currentCropH) > naturalHeight + 0.5) { // Add tolerance
          if (newErrors.h === '') {
            newErrors.y = `Y + Height exceeds video height (${naturalHeight}px).`;
          }
        }
      }
    } else {
      newErrors.x = ''; newErrors.y = ''; newErrors.w = ''; newErrors.h = '';
    }
    setErrors(newErrors);
  }, [cropX, cropY, cropW, cropH, naturalWidth, naturalHeight]);

  // Effect to apply aspect ratio when cropW is changed by user while AR is active
  useEffect(() => {
    // This effect ensures that if a specific aspect ratio (not 'custom' or 'original') is selected,
    // and the user manually changes the cropW (width), the cropH (height) is automatically
    // adjusted to maintain the selected aspect ratio.
    // `isProgrammaticRatioChangeRef.current` prevents this from running if the change to cropW was itself programmatic.
    // If change is from programmatic aspect ratio selection, skip this effect's adjustment
    if (isProgrammaticRatioChangeRef.current) return;

    if (selectedAspectRatioKey === 'custom' || selectedAspectRatioKey === 'original' || lastEditedDimension.current === 'height') {
      if (lastEditedDimension.current === 'height') lastEditedDimension.current = null;
      return;
    }
    // `lastEditedDimension.current` tracks which dimension (width or height) was last manually edited by the user.
    // This prevents a feedback loop if, for example, width changes height, and then height tries to change width back.
    const ratio = parseFloat(selectedAspectRatioKey);
    if (cropW !== null && !isNaN(cropW) && Number(cropW) >= MIN_CROP_DIMENSION && !isNaN(ratio) && ratio > 0 && naturalHeight > 0) {
      const newH = Math.round(cropW / ratio);
      const clampedH = Math.max(MIN_CROP_DIMENSION, Math.min(newH, naturalHeight - (cropY || 0)));
      if (clampedH !== cropH) {
        lastEditedDimension.current = 'width';
        setCropH(clampedH);
      }
    }
  }, [cropW, selectedAspectRatioKey, cropY, naturalHeight, setCropH, cropH]); // Removed isProgrammaticRatioChangeRef from deps as it's a ref

  // Effect to apply aspect ratio when cropH is changed by user while AR is active
  useEffect(() => {
    // Similar to the effect for cropW, this adjusts cropW if cropH is manually changed
    // while a specific aspect ratio is active.
    // `isProgrammaticRatioChangeRef.current` is reset here because this effect typically runs
    // after the cropW effect in a programmatic aspect ratio change sequence, marking the end of that sequence.
    // If change is from programmatic aspect ratio selection, skip this effect's adjustment
    // and reset the flag as this is the second effect to run in the cycle.
    if (isProgrammaticRatioChangeRef.current) {
        isProgrammaticRatioChangeRef.current = false; // Reset flag here
        return;
    }

    if (selectedAspectRatioKey === 'custom' || selectedAspectRatioKey === 'original' || lastEditedDimension.current === 'width') {
      if (lastEditedDimension.current === 'width') lastEditedDimension.current = null;
      return;
    }
    const ratio = parseFloat(selectedAspectRatioKey);
    if (cropH !== null && !isNaN(cropH) && Number(cropH) >= MIN_CROP_DIMENSION && !isNaN(ratio) && ratio > 0 && naturalWidth > 0) {
      const newW = Math.round(cropH * ratio);
      const clampedW = Math.max(MIN_CROP_DIMENSION, Math.min(newW, naturalWidth - (cropX || 0)));
      if (clampedW !== cropW) {
        lastEditedDimension.current = 'height';
        setCropW(clampedW);
      }
    }
  }, [cropH, selectedAspectRatioKey, cropX, naturalWidth, setCropW, cropW]); // Removed isProgrammaticRatioChangeRef from deps


  const handleAspectRatioChange = (event) => {
    const newKey = event.target.value;
    // console.log('[CropSettings.js handleAspectRatioChange] New AR Key selected:', newKey);
    setSelectedAspectRatioKey(newKey); // This now calls the prop function from Upload.js
    lastEditedDimension.current = null; 

    if (naturalWidth <= 0 || naturalHeight <= 0) return;
    // console.log('[CropSettings.js handleAspectRatioChange] Natural Dims:', { naturalWidth, naturalHeight });

    isProgrammaticRatioChangeRef.current = true; // Signal programmatic change

    if (newKey === 'custom') {
        // For custom, we don't auto-set crop. User defines it.
        // Resetting the flag is important if effects were skipped.
        // The cropH effect will reset it. If it doesn't run (e.g. no video yet),
        // console.log('[CropSettings.js handleAspectRatioChange] AR set to Custom.');
        // we might need to ensure it's false.
        // However, the effects will run due to setSelectedAspectRatioKey,
        // and the cropH effect will reset the flag.
      return;
    }

    if (newKey === 'original') {
      // console.log('[CropSettings.js handleAspectRatioChange] AR set to Original. Setting full dimensions.');
      setCropX(0);
      setCropY(0);
      setCropW(naturalWidth);
      setCropH(naturalHeight);
      // The effects will run, and the cropH effect will reset isProgrammaticRatioChangeRef
      return;
    }

    const targetRatio = parseFloat(newKey);
    if (isNaN(targetRatio) || targetRatio <= 0) {
        // console.warn('[CropSettings.js handleAspectRatioChange] Invalid targetRatio:', newKey);
        // Invalid ratio, reset flag if necessary (cropH effect will handle it)
        return;
    }

    let newW, newH;

    if ((naturalWidth / naturalHeight) > targetRatio) {
      // console.log('[CropSettings.js handleAspectRatioChange] Video is wider than target AR. Height is constraint.');
      newH = naturalHeight;
      newW = Math.round(newH * targetRatio);
    } else {
      // console.log('[CropSettings.js handleAspectRatioChange] Video is taller/same AR as target. Width is constraint.');
      newW = naturalWidth;
      newH = Math.round(newW / targetRatio);
    }
    
    let finalW = newW;
    let finalH = newH;

    // console.log('[CropSettings.js handleAspectRatioChange] Initial calculated W/H:', { finalW, finalH });

    if (finalW < MIN_CROP_DIMENSION) {
        finalW = MIN_CROP_DIMENSION;
        finalH = Math.round(finalW / targetRatio);
        // console.log('[CropSettings.js handleAspectRatioChange] Adjusted W to min, new H:', { finalW, finalH });
    }
    if (finalH < MIN_CROP_DIMENSION) {
        finalH = MIN_CROP_DIMENSION;
        finalW = Math.round(finalH * targetRatio);
        // console.log('[CropSettings.js handleAspectRatioChange] Adjusted H to min, new W:', { finalW, finalH });
    }

    if (finalW > naturalWidth) {
        const scale = naturalWidth / finalW;
        finalW = naturalWidth;
        finalH = Math.round(finalH * scale);
        // console.log('[CropSettings.js handleAspectRatioChange] Scaled down W due to naturalWidth, new H:', { finalW, finalH });
    }
    if (finalH > naturalHeight) {
        const scale = naturalHeight / finalH;
        finalH = naturalHeight;
        finalW = Math.round(finalW * scale);
        // console.log('[CropSettings.js handleAspectRatioChange] Scaled down H due to naturalHeight, new W:', { finalW, finalH });
    }
    
    finalW = Math.max(MIN_CROP_DIMENSION, Math.round(finalW));
    finalH = Math.max(MIN_CROP_DIMENSION, Math.round(finalH));

    // console.log('[CropSettings.js handleAspectRatioChange] Final W/H after min/max checks:', { finalW, finalH });
    // Ensure final dimensions are not greater than natural dimensions after all adjustments
    finalW = Math.min(finalW, naturalWidth);
    finalH = Math.min(finalH, naturalHeight);

    const newX = Math.round((naturalWidth - finalW) / 2);
    const newY = Math.round((naturalHeight - finalH) / 2);

    // console.log('[CropSettings.js handleAspectRatioChange] Setting crop states:', { newX, newY, finalW, finalH });
    setCropX(Math.max(0, newX));
    setCropY(Math.max(0, newY));
    setCropW(finalW);
    setCropH(finalH);
    // isProgrammaticRatioChangeRef will be reset by the cropH useEffect
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

      {!showVisualCropper && (
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
             {(!naturalWidth || !naturalHeight) && ( // Fixed condition
                  <Text as="span" fontStyle="italic"> (Video dimensions not available)</Text>
             )}
          </Text>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            <FormControl isInvalid={!!errors.x} id={`cropX-control`}>
              <FormLabel htmlFor="cropX" color={labelColor}>X</FormLabel>
              <NumberInput
                id="cropX"
                value={cropX ?? ''}
                min={0}
                max={naturalWidth > 0 && (cropW ?? 0) >= MIN_CROP_DIMENSION ? Math.max(0, naturalWidth - (cropW ?? MIN_CROP_DIMENSION)) : Math.max(0, naturalWidth - MIN_CROP_DIMENSION)}
                onChange={(valueString, valueAsNumber) => {
                    lastEditedDimension.current = 'x'; // Or not needed if not maintaining AR from X/Y edits
                    setCropX(valueString === '' ? null : valueAsNumber);
                }}
                placeholder="0"
                focusBorderColor="blue.500"
                 isDisabled={!naturalWidth || !naturalHeight || isProcessing || (selectedAspectRatioKey && selectedAspectRatioKey !== 'custom')}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {errors.x && <FormErrorMessage>{errors.x}</FormErrorMessage>}
            </FormControl>
            <FormControl isInvalid={!!errors.y} id={`cropY-control`}>
              <FormLabel htmlFor="cropY" color={labelColor}>Y</FormLabel>
              <NumberInput
                id="cropY"
                value={cropY ?? ''}
                min={0}
                max={naturalHeight > 0 && (cropH ?? 0) >= MIN_CROP_DIMENSION ? Math.max(0, naturalHeight - (cropH ?? MIN_CROP_DIMENSION)) : Math.max(0, naturalHeight - MIN_CROP_DIMENSION)}
                onChange={(valueString, valueAsNumber) => {
                    lastEditedDimension.current = 'y';
                    setCropY(valueString === '' ? null : valueAsNumber);
                }}
                placeholder="0"
                focusBorderColor="blue.500"
                 isDisabled={!naturalWidth || !naturalHeight || isProcessing || (selectedAspectRatioKey && selectedAspectRatioKey !== 'custom')}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {errors.y && <FormErrorMessage>{errors.y}</FormErrorMessage>}
            </FormControl>
            <FormControl isInvalid={!!errors.w} id={`cropW-control`}>
              <FormLabel htmlFor="cropW" color={labelColor}>Width</FormLabel>
              <NumberInput
                id="cropW"
                value={cropW ?? ''}
                min={MIN_CROP_DIMENSION} 
                max={naturalWidth > 0 && (cropX ?? 0) >= 0 ? Math.max(MIN_CROP_DIMENSION, naturalWidth - (cropX ?? 0)) : naturalWidth}
                onChange={(valueString, valueAsNumber) => {
                    if (selectedAspectRatioKey !== 'custom' && selectedAspectRatioKey !== 'original') {
                        lastEditedDimension.current = 'width';
                    } else {
                        lastEditedDimension.current = null;
                    }
                    setCropW(valueString === '' ? null : valueAsNumber);
                }}
                placeholder="e.g., 640"
                focusBorderColor="blue.500"
                 isDisabled={!naturalWidth || !naturalHeight || isProcessing}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {errors.w && <FormErrorMessage>{errors.w}</FormErrorMessage>}
            </FormControl>
            <FormControl isInvalid={!!errors.h} id={`cropH-control`}>
              <FormLabel htmlFor="cropH" color={labelColor}>Height</FormLabel>
              <NumberInput
                id="cropH"
                value={cropH ?? ''}
                min={MIN_CROP_DIMENSION} 
                max={naturalHeight > 0 && (cropY ?? 0) >= 0 ? Math.max(MIN_CROP_DIMENSION, naturalHeight - (cropY ?? 0)) : naturalHeight}
                onChange={(valueString, valueAsNumber) => {
                    if (selectedAspectRatioKey !== 'custom' && selectedAspectRatioKey !== 'original') {
                        lastEditedDimension.current = 'height';
                    } else {
                        lastEditedDimension.current = null;
                    }
                    setCropH(valueString === '' ? null : valueAsNumber);
                }}
                placeholder="e.g., 480"
                focusBorderColor="blue.500"
                 isDisabled={!naturalWidth || !naturalHeight || isProcessing}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
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
