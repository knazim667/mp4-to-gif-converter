import React from 'react';
import {
  Box,
  Heading, // Added Heading import
  Text, // Added Text import
  useColorModeValue,
} from '@chakra-ui/react';
import TrimSlider from './TrimSlider';

function TrimSettings({
  videoDuration,
  trimStart, // Added prop
  trimEnd,   // Added prop
  onTrimChange,
  scenePoints,
}) {
  const settingsBoxBg = useColorModeValue('white', 'gray.750');
   const settingsHeadingColor = useColorModeValue('gray.700', 'whiteAlpha.900'); // Added Heading color

  // TrimSlider expects a number duration, default to 0 if null/undefined
  const safeVideoDuration = videoDuration || 0;

  return (
    <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg" shadow="md" mb={8} bg={settingsBoxBg} id="trim-section">
      {/* Added Heading here for consistency */}
      <Heading as="h4" size={{ base: 'sm', md: 'md' }} mb={5} color={settingsHeadingColor}>Trim Video</Heading>
      {/* Only render TrimSlider if duration is available and positive */}
      {safeVideoDuration > 0 ? (
           <TrimSlider
             duration={safeVideoDuration}
             initialStart={trimStart} // Pass down
             initialEnd={trimEnd}     // Pass down
             onTrimChange={onTrimChange} // Assume is a function
             scenes={scenePoints || []} // Default to empty array
           />
      ) : (
          <Text color={useColorModeValue('gray.500', 'gray.400')}>Video duration not available for trimming.</Text>
      )}
    </Box>
  );
}

export default TrimSettings;