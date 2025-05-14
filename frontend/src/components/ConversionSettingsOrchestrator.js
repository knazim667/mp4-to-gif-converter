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
  Checkbox,
  Button,
  Input,
  Select,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import TrimSlider from './TrimSlider';

// This component will orchestrate all conversion settings.
// For now, it's a direct lift from Upload.js, but can be broken down further.
function ConversionSettingsOrchestrator({
  // Props from Upload.js
  videoDuration,
  trim,
  onTrimChange,
  scenePoints,
  fps,
  setFps,
  width,
  setWidth,
  includeAudio,
  setIncludeAudio,
  showVisualCropper,
  setShowVisualCropper,
  videoSrc, // For disabling visual cropper button
  videoPreviewDimensions, // For disabling visual cropper button
  isProcessing, // Combined loading state (isUploading || isAnalyzing || isConverting)
  cropX, setCropX,
  cropY, setCropY,
  cropW, setCropW,
  cropH, setCropH,
  textOverlay, setTextOverlay,
  fontSize, setFontSize,
  fontStyle, setFontStyle, fontStyleOptions,
  textColor, setTextColor,
  textBgColor, setTextBgColor,
  textPosition, setTextPosition,
  speedFactor, setSpeedFactor,
  reverse, setReverse,
  // Preset related
  presets,
  selectedPreset,
  onPresetChange,
}) {
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const settingsBoxBg = useColorModeValue('white', 'gray.750');
  const settingsHeadingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const selectBgColor = useColorModeValue("white", "gray.700");


  if (!videoDuration || videoDuration <= 0) {
    return null; // Don't render settings if no video is processed
  }

  return (
    <Box mt={10}>
      <Heading as="h3" size="lg" mb={6} textAlign="center" borderBottomWidth="2px" borderColor={borderColor} pb={3}>
        Conversion Settings
      </Heading>

      {/* Preset Selection */}
      <FormControl mb={8} id="preset-selection">
        <FormLabel htmlFor="presetSelect" color={labelColor} fontWeight="medium">Quick Presets</FormLabel>
        <Select id="presetSelect" value={selectedPreset} onChange={onPresetChange} focusBorderColor="blue.500" size="lg" bg={selectBgColor}>
          {presets.map(preset => (
            <option key={preset.name} value={preset.name}>
              {preset.name}
            </option>
          ))}
        </Select>
      </FormControl>

      <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg" shadow="md" mb={8} bg={settingsBoxBg} id="trim-section">
        <TrimSlider
          duration={videoDuration}
          onTrimChange={onTrimChange}
          scenes={scenePoints}
        />
      </Box>

      <VStack spacing={8} align="stretch">
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
              <NumberInput id="width" value={width} min={100} max={1920} step={10} onChange={(_valStr, valNum) => setWidth(valNum)} focusBorderColor="blue.500">
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
            <FormControl><FormLabel htmlFor="cropX" color={labelColor}>X</FormLabel><NumberInput id="cropX" value={cropX ?? ''} min={0} onChange={(vS, vN) => setCropX(vS === '' ? null : vN)} placeholder="0"><NumberInputField /></NumberInput></FormControl>
            <FormControl><FormLabel htmlFor="cropY" color={labelColor}>Y</FormLabel><NumberInput id="cropY" value={cropY ?? ''} min={0} onChange={(vS, vN) => setCropY(vS === '' ? null : vN)} placeholder="0"><NumberInputField /></NumberInput></FormControl>
            <FormControl><FormLabel htmlFor="cropW" color={labelColor}>Width</FormLabel><NumberInput id="cropW" value={cropW ?? ''} min={0} onChange={(vS, vN) => setCropW(vS === '' ? null : vN)} placeholder="e.g., 640"><NumberInputField /></NumberInput></FormControl>
            <FormControl><FormLabel htmlFor="cropH" color={labelColor}>Height</FormLabel><NumberInput id="cropH" value={cropH ?? ''} min={0} onChange={(vS, vN) => setCropH(vS === '' ? null : vN)} placeholder="e.g., 480"><NumberInputField /></NumberInput></FormControl>
          </SimpleGrid>
        </Box>

        <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg" shadow="md" bg={settingsBoxBg} id="text-overlay-section">
          <Heading as="h4" size="md" mb={5} color={settingsHeadingColor}>Text Overlay</Heading>
          <VStack spacing={5} align="stretch">
            <FormControl><FormLabel htmlFor="textOverlay" color={labelColor}>Text</FormLabel><Input id="textOverlay" value={textOverlay} onChange={(e) => setTextOverlay(e.target.value)} /></FormControl>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl><FormLabel htmlFor="fontSize" color={labelColor}>Font Size</FormLabel><NumberInput id="fontSize" value={fontSize} min={8} max={100} onChange={(vS,vN)=>setFontSize(vN)}><NumberInputField /><NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper></NumberInput></FormControl>
              <FormControl><FormLabel htmlFor="fontStyle" color={labelColor}>Font Style</FormLabel>
                <Select id="fontStyle" value={fontStyle} onChange={(e) => setFontStyle(e.target.value)}>
                  {fontStyleOptions.map((font) => (<option key={font} value={font}>{font}</option>))}
                </Select>
              </FormControl>
            </SimpleGrid>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl><FormLabel htmlFor="textColor" color={labelColor}>Text Color</FormLabel><Input id="textColor" value={textColor} onChange={(e) => setTextColor(e.target.value)} /></FormControl>
              <FormControl><FormLabel htmlFor="textBgColor" color={labelColor}>BG Color (opt.)</FormLabel><Input id="textBgColor" value={textBgColor} onChange={(e) => setTextBgColor(e.target.value)} /></FormControl>
            </SimpleGrid>
            <FormControl><FormLabel htmlFor="textPosition" color={labelColor}>Position</FormLabel>
              <Select id="textPosition" value={textPosition} onChange={(e) => setTextPosition(e.target.value)}>
                <option value="center">Center</option>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
              </Select>
            </FormControl>
          </VStack>
        </Box>

        <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg" shadow="md" bg={settingsBoxBg} id="effects-section">
          <Heading as="h4" size="md" mb={5} color={settingsHeadingColor}>Video Effects</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} alignItems="center">
            <FormControl>
              <FormLabel htmlFor="speedFactor" color={labelColor}>Speed Factor</FormLabel>
              <NumberInput id="speedFactor" value={speedFactor} min={0.1} max={5.0} step={0.1} precision={1} onChange={(vS,vN)=>setSpeedFactor(parseFloat(vN) || 1.0)}>
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
      </VStack>
    </Box>
  );
}

export default ConversionSettingsOrchestrator;