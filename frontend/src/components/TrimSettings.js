import React from 'react';
import {
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import TrimSlider from './TrimSlider'; // Assuming TrimSlider is in the same directory

function TrimSettings({
  videoDuration,
  onTrimChange,
  scenePoints,
}) {
  const settingsBoxBg = useColorModeValue('white', 'gray.750');

  return (
    <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg" shadow="md" mb={8} bg={settingsBoxBg} id="trim-section">
      <TrimSlider
        duration={videoDuration}
        onTrimChange={onTrimChange}
        scenes={scenePoints}
      />
    </Box>
  );
}

export default TrimSettings;