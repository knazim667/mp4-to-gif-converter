import React, { useState } from 'react';
import { Box, Heading, FormControl, FormLabel, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Text } from '@chakra-ui/react';

function TrimSlider({ duration, onTrimChange }) {
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(duration);

  const handleStartChange = (value) => {
    if (value < end) {
      setStart(value);
      onTrimChange({ start: value, end });
    }
  };

  const handleEndChange = (value) => {
    if (value > start) {
      setEnd(value);
      onTrimChange({ start, end: value });
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
