import React from 'react';
import { Box, Heading, Text, VStack, Center, useColorModeValue } from '@chakra-ui/react';
import Upload from '../components/Upload'; // Your main upload component
import { Helmet } from 'react-helmet-async'; // For setting page title and meta description

function HomePage() {
  const pageBg = useColorModeValue('gray.50', 'gray.850'); // Slightly darker than footer for contrast if needed
  const headingColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box bg={pageBg} flexGrow={1}> {/* Ensure it takes up space */}
      <Helmet>
        <title>EasyGIFMaker: Free Online MP4 to GIF Converter & Editor</title>
        <meta name="description" content="Easily convert MP4s, YouTube videos, and more to high-quality animated GIFs with EasyGIFMaker.com. Free online tool with trimming, text overlay, cropping, speed adjustment, and reverse effects." />
      </Helmet>
      <VStack spacing={4} mb={8} pt={8}> {/* Added pt to give some space from top if no navbar */}
        <Heading as="h1" size={{ base: 'xl', md: '2xl' }} color={headingColor} textAlign="center">
          EasyGIFMaker.com
        </Heading>
        <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor} textAlign="center" px={4}>
          Your free online tool to effortlessly convert MP4s & videos to animated GIFs and short MP4 clips.
        </Text>
      </VStack>
      <Center pb={8}> {/* Added pb for spacing before footer */}
        <Upload />
      </Center>
    </Box>
  );
}

export default HomePage;