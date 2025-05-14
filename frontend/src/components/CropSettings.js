import React from 'react';
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
        <FormControl>
          <FormLabel htmlFor="cropX" color={labelColor}>X</FormLabel>
          <NumberInput id="cropX" value={cropX ?? ''} min={0} onChange={(vS, vN) => setCropX(vS === '' ? null : parseInt(vN, 10))} placeholder="0" focusBorderColor="blue.500">
            <NumberInputField />
          </NumberInput>
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="cropY" color={labelColor}>Y</FormLabel>
          <NumberInput id="cropY" value={cropY ?? ''} min={0} onChange={(vS, vN) => setCropY(vS === '' ? null : parseInt(vN, 10))} placeholder="0" focusBorderColor="blue.500">
            <NumberInputField />
          </NumberInput></FormControl>
        <FormControl>
          <FormLabel htmlFor="cropW" color={labelColor}>Width</FormLabel>
          <NumberInput id="cropW" value={cropW ?? ''} min={0} onChange={(vS, vN) => setCropW(vS === '' ? null : parseInt(vN, 10))} placeholder="e.g., 640" focusBorderColor="blue.500">
            <NumberInputField />
          </NumberInput></FormControl>
        <FormControl>
          <FormLabel htmlFor="cropH" color={labelColor}>Height</FormLabel>
          <NumberInput id="cropH" value={cropH ?? ''} min={0} onChange={(vS, vN) => setCropH(vS === '' ? null : parseInt(vN, 10))} placeholder="e.g., 480" focusBorderColor="blue.500">
            <NumberInputField />
          </NumberInput></FormControl>
      </SimpleGrid>
    </Box>
  );
}

export default CropSettings;