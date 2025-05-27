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
  videoSrc,
  videoPreviewDimensions,
  isProcessing,
  cropX, setCropX,
  cropY, setCropY,
  selectedAspectRatioKey, setSelectedAspectRatioKey, // Added props for aspect ratio
  cropW, setCropW,
  cropH, setCropH,
  textOverlay, setTextOverlay,
  fontSize, setFontSize,
  fontStyle, setFontStyle, fontStyleOptions, // Ensure fontStyleOptions is passed and is an array
  textColor, setTextColor,
  textBgColor, setTextBgColor,
  textPosition, setTextPosition,
  speedFactor, setSpeedFactor,
  reverse, setReverse,
  // Preset related
  presets, // Ensure presets is passed and is an array
  selectedPreset,
  onPresetChange,
}) {
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const labelColor = useColorModeValue('gray.600', 'gray.400');

  // Don't render settings if essential props are missing or invalid
  if (!videoDuration || videoDuration <= 0) {
    // console.warn("ConversionSettingsOrchestrator not rendering: Invalid video duration.", videoDuration);
    return null;
  }
  // Add checks for other critical props if necessary, though videoDuration is the main gate

  return (
    <Box mt={{ base: 6, md: 10 }} maxWidth="container.lg" px={0}>
      <Heading as="h3" size={{ base: 'md', md: 'lg' }} mb={{ base: 4, md: 6 }} textAlign="center" borderBottomWidth="2px" borderColor={borderColor} pb={{ base: 2, md: 3 }}>
        Conversion Settings
      </Heading>

      {/* Preset Selection */}
      {/* Ensure presets array is valid before mapping */}
      {(presets && Array.isArray(presets) && presets.length > 0) && ( // px added for consistency
          <FormControl mb={8} id="preset-selection" px={{ base: 4, md: 0 }}>
            <FormLabel htmlFor="presetSelect" color={labelColor} fontWeight="medium">Quick Presets</FormLabel>
            <Select id="presetSelect" value={selectedPreset} onChange={onPresetChange} focusBorderColor="blue.500" size="lg" bg={useColorModeValue("white", "gray.700")}>
              {presets.map(preset => (
                // Ensure preset.name and preset are valid
                <option key={preset?.name || 'default'} value={preset?.name || ''} disabled={!preset?.name}>
                  {preset?.name || 'Invalid Preset'}
                </option>
              ))}
            </Select>
          </FormControl>
      )}


      <Tabs isLazy variant="enclosed-colored" colorScheme="blue" mt={{ base: 4, md: 6 }}>
        <TabList overflowX="auto" overflowY="hidden" pb={2}>
          <Tab>Trim</Tab>
          <Tab>Output</Tab>
          <Tab>Crop</Tab>
          <Tab>Text Overlay</Tab>
          <Tab>Effects</Tab>
        </TabList>

        <TabPanels mt={4}>
          <TabPanel p={{ base: 2, md: 0 }}>
            {/* Pass props, handle potential null/undefined defensively in child components */}
            <TrimSettings
              videoDuration={videoDuration || 0} // Default to 0
              onTrimChange={onTrimChange} // Assume onTrimChange is always a function or check its type
              scenes={scenePoints || []} // Default to empty array
            />
          </TabPanel>
          <TabPanel p={{ base: 2, md: 0 }}>
             {/* Pass props, handle potential null/undefined defensively in child components */}
            <OutputOptionsSettings
              fps={fps ?? 10} // Default if null/undefined
              setFps={setFps} // Assume setFps is always a function
              width={width ?? 320} // Default if null/undefined
              setWidth={setWidth} // Assume setWidth is always a function
              includeAudio={includeAudio ?? false} // Default if null/undefined
              setIncludeAudio={setIncludeAudio} // Assume setIncludeAudio is always a function
            />
          </TabPanel>
          <TabPanel p={{ base: 2, md: 0 }}>
            {/* Pass props, handle potential null/undefined defensively in child components */}
            <CropSettings
              showVisualCropper={showVisualCropper ?? false} // Default
              setShowVisualCropper={setShowVisualCropper} // Assume is a function
              videoSrc={videoSrc} // Can be null
              videoPreviewDimensions={videoPreviewDimensions || { width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 }} // Default object
              isProcessing={isProcessing ?? false} // Default
              cropX={cropX} setCropX={setCropX} // Can be null, assume setters are functions
              cropY={cropY} setCropY={setCropY}
              cropW={cropW} setCropW={setCropW}
              cropH={cropH} setCropH={setCropH}
              selectedAspectRatioKey={selectedAspectRatioKey} // Pass down
              setSelectedAspectRatioKey={setSelectedAspectRatioKey} // Pass down
            />
          </TabPanel>
          <TabPanel p={{ base: 2, md: 0 }}>
            {/* Pass props, handle potential null/undefined defensively in child components */}
            <TextOverlaySettings
              textOverlay={textOverlay ?? ''} // Default to empty string
              setTextOverlay={setTextOverlay} // Assume is a function
              fontSize={fontSize ?? 20} // Default
              setFontSize={setFontSize} // Assume is a function
              fontStyle={fontStyle ?? 'Arial'} // Default
              setFontStyle={setFontStyle} // Assume is a function
              fontStyleOptions={fontStyleOptions || []} // Default to empty array
              textColor={textColor ?? 'white'} // Default
              setTextColor={setTextColor} // Assume is a function
              textBgColor={textBgColor ?? ''} // Default to empty string
              setTextBgColor={setTextBgColor} // Assume is a function - this is where the error was reported
              textPosition={textPosition ?? 'center'} // Default
              setTextPosition={setTextPosition} // Assume is a function
            />
          </TabPanel>
          <TabPanel p={{ base: 2, md: 0 }}>
             {/* Pass props, handle potential null/undefined defensively in child components */}
            <VideoEffectsSettings
              speedFactor={speedFactor ?? 1.0} // Default
              setSpeedFactor={setSpeedFactor} // Assume is a function
              reverse={reverse ?? false} // Default
              setReverse={setReverse} // Assume is a function
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default ConversionSettingsOrchestrator;