import React, { useState, useEffect } from 'react';
import { Box, Heading, FormControl, FormLabel, Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark, Text, useColorModeValue } from '@chakra-ui/react'; // Added useColorModeValue

function TrimSlider({ duration, scenes = [], onTrimChange, initialStart, initialEnd }) {
  // Ensure duration is a valid number, default to a small value if not, to avoid issues
  const safeDuration = typeof duration === 'number' && duration > 0 ? duration : 1; // Use 1s as a minimal duration

  // Initialize state based on props or defaults. useEffect will further refine this.
  const [start, setStart] = useState(typeof initialStart === 'number' ? initialStart : 0);
  const [end, setEnd] = useState(typeof initialEnd === 'number' ? initialEnd : safeDuration);

  const labelColor = useColorModeValue('gray.600', 'gray.400'); // Use color mode value for text

  useEffect(() => {
    // This effect synchronizes the slider's internal state with the desired trim values
    // derived from props (initialStart, initialEnd) and the current video duration (safeDuration).
    // It runs when the video duration changes or when the parent component suggests new initial trim points.

    const newStartValue = (typeof initialStart === 'number' && initialStart >= 0 && initialStart < safeDuration)
      ? initialStart
      : 0;
    const newEndValue = (typeof initialEnd === 'number' && initialEnd > newStartValue && initialEnd <= safeDuration)
      ? initialEnd
      : safeDuration;

    setStart(newStartValue);
    setEnd(newEndValue);
    if (typeof onTrimChange === 'function') {
        onTrimChange({ start: newStartValue, end: newEndValue });
    }
  }, [safeDuration, onTrimChange]); // Depend on safeDuration and the stable onTrimChange callback.

  const handleStartChange = (value) => {
    const snappedValue = value; // Simplified snapping for robustness, can re-add scene snapping if needed

    // Ensure start does not exceed end
    const newStart = Math.min(snappedValue, end);
    setStart(newStart);
    if (typeof onTrimChange === 'function') {
        onTrimChange({ start: newStart, end });
    } else {
         console.error("TrimSlider: onTrimChange prop is not a function during start change.");
    }
  };

  const handleEndChange = (value) => {
     const snappedValue = value; // Simplified snapping

     // Ensure end does not go below start
    const newEnd = Math.max(snappedValue, start);
    setEnd(newEnd);
    if (typeof onTrimChange === 'function') {
        onTrimChange({ start, end: newEnd });
    } else {
         console.error("TrimSlider: onTrimChange prop is not a function during end change.");
    }
  };

  // Optional: Display a message if duration is invalid
  if (typeof duration !== 'number' || duration <= 0) {
      return (
           <Box>
               <Heading as="h4" size={{ base: 'sm', md: 'md' }} color={useColorModeValue('gray.800', 'whiteAlpha.900')} mb={2}>
                   Trim Video
               </Heading>
               <Text color={labelColor}>Video duration is required for trimming.</Text>
           </Box>
      );
  }


  return (
    <Box mt={4}>
      <Heading as="h3" size={{ base: 'sm', md: 'md' }} color={useColorModeValue('gray.800', 'whiteAlpha.900')} mb={2}>
        {/* Trim Video - Heading moved to TrimSettings for consistency */}
      </Heading>
      <Box>
        <FormControl>
          <FormLabel fontSize="sm" color={labelColor}> {/* Use color mode value */}
            Start (s)
          </FormLabel>
          <Slider
            min={0}
            max={safeDuration} // Use safe duration
            step={0.1}
            value={start}
            onChange={handleStartChange}
            focusThumbOnChange={false}
             isDisabled={safeDuration <= 0} // Disable if duration is not valid
          >
            <SliderTrack bg={useColorModeValue("gray.100", "gray.600")}> {/* Use color mode value */}
              <SliderFilledTrack bg="blue.500" />
            </SliderTrack>
            {(scenes || []).map((scene) => ( // Ensure scenes is an array
              <SliderMark
                key={scene}
                value={scene}
                mt={2}
                ml={-2}
                color={useColorModeValue("gray.600", "gray.400")} 
                fontSize="sm"
              >
                |
              </SliderMark>
            ))}
            <SliderThumb boxSize={6} />
          </Slider>
          <Text fontSize="sm" color={labelColor}> {/* Use color mode value */}
            {start.toFixed(1)}s
          </Text>
        </FormControl>
        <FormControl mt={2}>
          <FormLabel fontSize="sm" color={labelColor}> {/* Use color mode value */}
            End (s)
          </FormLabel>
          <Slider
            min={0}
            max={safeDuration} // Use safe duration
            step={0.1}
            value={end}
            onChange={handleEndChange}
            focusThumbOnChange={false}
             isDisabled={safeDuration <= 0} // Disable if duration is not valid
          >
            <SliderTrack bg={useColorModeValue("gray.100", "gray.600")}> {/* Use color mode value */}
              <SliderFilledTrack bg="blue.500" />
            </SliderTrack>
            {(scenes || []).map((scene) => ( // Ensure scenes is an array
              <SliderMark
                key={scene}
                value={scene}
                mt={2}
                ml={-2}
                color={useColorModeValue("gray.600", "gray.400")} 
                fontSize="sm"
              >
                |
              </SliderMark>
            ))}
            <SliderThumb boxSize={6} />
          </Slider>
          <Text fontSize="sm" color={labelColor}> {/* Use color mode value */}
            {end.toFixed(1)}s
          </Text>
        </FormControl>
      </Box>
    </Box>
  );
}

export default TrimSlider;