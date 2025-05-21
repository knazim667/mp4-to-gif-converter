import React from 'react';
import {
  Box, Heading, Text, VStack, Center, useColorModeValue,
  List, ListItem, ListIcon, Divider, Link as ChakraLink
} from '@chakra-ui/react';
import Upload from '../components/Upload'; // Your main upload component
import { Helmet } from 'react-helmet-async'; // For setting page title and meta description

function HomePage() {
  const pageBg = useColorModeValue('gray.50', 'gray.850'); // Slightly darker than footer for contrast if needed
  const headingColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const sectionBg = useColorModeValue('white', 'gray.750');
  const sectionHeadingColor = useColorModeValue('gray.700', 'whiteAlpha.900');

  return (
    <Box bg={pageBg} flexGrow={1}> {/* Ensure it takes up space */}
      <Helmet>
        <title>EasyGIFMaker: Free Online MP4 to GIF Converter & Editor</title>
        <meta name="description" content="Easily convert MP4s, YouTube videos, and more to high-quality animated GIFs with EasyGIFMaker.com. Free online tool with trimming, text overlay, cropping, speed adjustment, and reverse effects." />
      </Helmet>
      <VStack spacing={4} mb={{ base: 6, md: 8 }} pt={{ base: 4, md: 8 }}> {/* Added pt to give some space from top if no navbar */}
        <Heading as="h1" size={{ base: 'xl', md: '2xl' }} color={headingColor} textAlign="center">
          EasyGIFMaker.com
        </Heading>
        <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor} textAlign="center" px={4}>
          Your free online tool to effortlessly convert MP4s & videos to animated GIFs and short MP4 clips.
        </Text>
      </VStack>
      <Center pb={{ base: 6, md: 8 }} flexDirection="column" px={{ base: 2, md: 0 }}> {/* Added px for small padding on mobile */}
        <Upload />

        {/* Quick Tips Section */}
        <Box mt={{ base: 8, md: 12 }} p={{ base: 4, md: 6 }} bg={sectionBg} borderRadius="lg" shadow="md" w="full" maxW={{ base: "full", md: "2xl" }}>
          <Heading as="h3" size={{ base: 'md', md: 'lg' }} mb={4} color={sectionHeadingColor} textAlign="center">
            Quick Tips for Best Results
          </Heading>
          <List spacing={3} color={textColor} fontSize={{ base: 'sm', md: 'md' }}>
            <ListItem>
              <ListIcon as={() => '💡'} color="yellow.500" />
              For smaller GIF sizes, try reducing the FPS or the output width in the "Output" settings.
            </ListItem>
            <ListItem>
              <ListIcon as={() => '✂️'} color="blue.500" />
              Use the "Trim" feature to select only the most impactful part of your video.
            </ListItem>
            <ListItem>
              <ListIcon as={() => '🖼️'} color="green.500" />
              The "Crop" tool is perfect for focusing on a specific area of your video.
            </ListItem>
            <ListItem>
              <ListIcon as={() => '✍️'} color="purple.500" />
              Add personality with "Text Overlay" – experiment with fonts, colors, and positions!
            </ListItem>
            <ListItem>
              <ListIcon as={() => '🚀'} color="orange.500" />
              Check out "Quick Presets" for common configurations if you're in a hurry.
            </ListItem>
          </List>
        </Box>

        <Divider my={{ base: 6, md: 10 }} maxW={{ base: "90%", md: "2xl" }} />

        {/* About the Tool Section */}
        <Box p={{ base: 4, md: 6 }} w="full" maxW={{ base: "full", md: "2xl" }} textAlign="center">
          <Heading as="h3" size={{ base: 'md', md: 'lg' }} mb={3} color={sectionHeadingColor}>
            More Than Just a Converter
          </Heading>
          <Text color={textColor} fontSize={{ base: 'sm', md: 'md' }} mb={4}>
            EasyGIFMaker.com provides a comprehensive suite of tools to transform your videos. From precise trimming and cropping to creative text overlays and effects, you have full control to create the perfect GIF or short MP4 clip. All online, for free!
          </Text>
          <ChakraLink href="/about" color="blue.500" fontWeight="semibold">Learn more about our features &rarr;</ChakraLink>
        </Box>
      </Center>
    </Box>
  );
}

export default HomePage;