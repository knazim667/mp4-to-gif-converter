import React from 'react';
import { Box, Heading, Text, VStack, OrderedList, ListItem, Code, useColorModeValue } from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';

function GuideMP4ToGIF() {
  const headingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const codeBgColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box p={{ base: 4, md: 8 }} maxW="container.lg" mx="auto">
      <Helmet>
        <title>How to Convert MP4 to GIF - EasyGIFMaker.com Guide</title>
        <meta name="description" content="Step-by-step guide on how to use EasyGIFMaker.com to convert your MP4 videos into animated GIFs quickly and easily." />
      </Helmet>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size={{ base: 'lg', md: 'xl' }} textAlign="center" color={headingColor}>
          How to Convert MP4 to GIF with EasyGIFMaker.com
        </Heading>

        <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
          Converting your MP4 videos to animated GIFs is simple with EasyGIFMaker.com. Follow these easy steps:
        </Text>

        <OrderedList spacing={5} color={textColor} stylePosition="inside" fontSize={{ base: 'sm', md: 'md' }}>
          <ListItem>
            <Text fontWeight="semibold" display="inline">Upload Your MP4 Video:</Text> You can either drag and drop your MP4 file into the upload zone, click to browse and select the file from your computer, or paste a video URL (including YouTube links).
          </ListItem>
          <ListItem>
            <Text fontWeight="semibold" display="inline">Process Video:</Text> Click the "Process Video" button. Our tool will upload (if necessary) and analyze your video to prepare it for editing.
          </ListItem>
          <ListItem>
            <Text fontWeight="semibold" display="inline">Adjust Settings (Optional):</Text> Use the tabs to:
            <UnorderedList styleType="circle" pl={6} mt={1}>
              <ListItem><strong>Trim:</strong> Select the exact start and end points for your GIF.</ListItem>
              <ListItem><strong>Output:</strong> Set FPS and width.</ListItem>
              <ListItem><strong>Crop:</strong> Visually or numerically crop the video frame.</ListItem>
              <ListItem><strong>Text Overlay:</strong> Add and style text on your GIF.</ListItem>
              <ListItem><strong>Effects:</strong> Change speed or reverse the video.</ListItem>
            </UnorderedList>
            Alternatively, choose a "Quick Preset" for common settings.
          </ListItem>
          <ListItem>
            <Text fontWeight="semibold" display="inline">Convert to GIF:</Text> Once you're happy with the settings, click the "Convert to GIF" button (it might say "Convert to MP4" if audio is included, so ensure "Include Audio" is unchecked for GIF output).
          </ListItem>
          <ListItem>
            <Text fontWeight="semibold" display="inline">Preview and Download:</Text> Your animated GIF will be generated and displayed. Click the "Download GIF" button to save it to your device!
          </ListItem>
        </OrderedList>

        <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor} mt={4}>
          That's it! You've successfully created an animated GIF from your MP4 video.
        </Text>
      </VStack>
    </Box>
  );
}

export default GuideMP4ToGIF;