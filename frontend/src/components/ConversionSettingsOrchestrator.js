import React from 'react';
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Select,
  useColorModeValue,
  Tabs, 
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import TrimSettings from './TrimSettings';
import OutputOptionsSettings from './OutputOptionsSettings';
import CropSettings from './CropSettings';
import TextOverlaySettings from './TextOverlaySettings';
import VideoEffectsSettings from './VideoEffectsSettings';

// This component will orchestrate all conversion settings.
function ConversionSettingsOrchestrator({
  // Props from Upload.js
  videoDuration,
  trim, // trim is used by TrimSlider internally if passed as 'value', but TrimSlider manages its own state
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
  const labelColor = useColorModeValue('gray.600', 'gray.400');


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
        <Select id="presetSelect" value={selectedPreset} onChange={onPresetChange} focusBorderColor="blue.500" size="lg" bg={useColorModeValue("white", "gray.700")}>
          {presets.map(preset => (
            <option key={preset.name} value={preset.name}>
              {preset.name}
            </option>
          ))}
        </Select>
      </FormControl>
      
      <Tabs isLazy variant="enclosed-colored" colorScheme="blue" mt={6}>
        <TabList overflowX="auto" overflowY="hidden" pb={2}> {/* Allow horizontal scrolling for tabs on small screens */}
          <Tab>Trim</Tab>
          <Tab>Output</Tab>
          <Tab>Crop</Tab>
          <Tab>Text Overlay</Tab>
          <Tab>Effects</Tab>
        </TabList>

        <TabPanels mt={4}>
          <TabPanel p={0}> {/* Remove default padding from TabPanel if components have their own */}
            <TrimSettings
              videoDuration={videoDuration}
              onTrimChange={onTrimChange}
              scenes={scenePoints}
            />
          </TabPanel>
          <TabPanel p={0}>
            <OutputOptionsSettings
              fps={fps} setFps={setFps}
              width={width} setWidth={setWidth}
              includeAudio={includeAudio} setIncludeAudio={setIncludeAudio}
            />
          </TabPanel>
          <TabPanel p={0}>
            <CropSettings
              showVisualCropper={showVisualCropper} setShowVisualCropper={setShowVisualCropper}
              videoSrc={videoSrc}
              videoPreviewDimensions={videoPreviewDimensions}
              isProcessing={isProcessing}
              cropX={cropX} setCropX={setCropX}
              cropY={cropY} setCropY={setCropY}
              cropW={cropW} setCropW={setCropW}
              cropH={cropH} setCropH={setCropH}
            />
          </TabPanel>
          <TabPanel p={0}>
            <TextOverlaySettings
              textOverlay={textOverlay} setTextOverlay={setTextOverlay}
              fontSize={fontSize} setFontSize={setFontSize}
              fontStyle={fontStyle} setFontStyle={setFontStyle} fontStyleOptions={fontStyleOptions}
              textColor={textColor} setTextColor={setTextColor}
              textBgColor={textBgColor} setTextBgColor={setTextBgColor}
              textPosition={textPosition} setTextPosition={setTextPosition}
            />
          </TabPanel>
          <TabPanel p={0}>
            <VideoEffectsSettings
              speedFactor={speedFactor} setSpeedFactor={setSpeedFactor}
              reverse={reverse} setReverse={setReverse}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default ConversionSettingsOrchestrator;
