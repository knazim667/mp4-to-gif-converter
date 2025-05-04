import React, { useState, useEffect } from 'react';
import { Box, Heading, FormControl, FormLabel, Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark, Text } from '@chakra-ui/react';

function TrimSlider({ duration, scenes = [], onTrimChange }) {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(duration);

  useEffect(() => {
    if (duration) {
      setEnd(duration);
      onTrimChange({ start, end: duration });
    }
  }, [duration]);

  const handleStartChange = (value) => {
    // Find the nearest scene point
    const nearestScene = scenes.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev, value
    );
    const snappedValue = Math.abs(nearestScene - value) < 0.5 ? nearestScene : value;
    
    if (snappedValue < end) {
      setStart(snappedValue);
      onTrimChange({ start: snappedValue, end });
    }
  };

  const handleEndChange = (value) => {
    // Find the nearest scene point
    const nearestScene = scenes.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev, value
    );
    const snappedValue = Math.abs(nearestScene - value) < 0.5 ? nearestScene : value;
    
    if (snappedValue > start) {
      setEnd(snappedValue);
      onTrimChange({ start, end: snappedValue });
    }
  };

  return (
    <Box mt={4}>
      <Heading as="h3" size="md" color="gray.800" mb={2}>
        Trim Video
      </Heading>
      <Box>
        <FormControl>
          <FormLabel fontSize="sm" color="gray.600">
            Start (s)
          </FormLabel>
          <Slider
            min={0}
            max={duration}
            step={0.1}
            value={start}
            onChange={handleStartChange}
            focusThumbOnChange={false}
          >
            <SliderTrack bg="gray.100">
              <SliderFilledTrack bg="blue.500" />
            </SliderTrack>
            {scenes.map((scene) => (
              <SliderMark
                key={scene}
                value={scene}
                mt={2}
                ml={-2}
                color="gray.600"
                fontSize="sm"
              >
                |
              </SliderMark>
            ))}
            <SliderThumb boxSize={6} />
          </Slider>
          <Text fontSize="sm" color="gray.600">
            {start.toFixed(1)}s
          </Text>
        </FormControl>
        <FormControl mt={2}>
          <FormLabel fontSize="sm" color="gray.600">
            End (s)
          </FormLabel>
          <Slider
            min={0}
            max={duration}
            step={0.1}
            value={end}
            onChange={handleEndChange}
            focusThumbOnChange={false}
          >
            <SliderTrack bg="gray.100">
              <SliderFilledTrack bg="blue.500" />
            </SliderTrack>
            {scenes.map((scene) => (
              <SliderMark
                key={scene}
                value={scene}
                mt={2}
                ml={-2}
                color="gray.600"
                fontSize="sm"
              >
                |
              </SliderMark>
            ))}
            <SliderThumb boxSize={6} />
          </Slider>
          <Text fontSize="sm" color="gray.600">
            {end.toFixed(1)}s
          </Text>
        </FormControl>
      </Box>
    </Box>
  );
}

export default TrimSlider;