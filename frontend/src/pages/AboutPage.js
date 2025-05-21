import React from 'react';
import { Box, Heading, Text, VStack, Link, Icon, useColorModeValue } from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { FiGithub } from 'react-icons/fi'; // Example Icon

function AboutPage() {
  const headingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box p={{ base: 4, md: 8 }} maxW="container.md" mx="auto">
      <Helmet>
        <title>About Us - EasyGIFMaker.com</title>
        <meta name="description" content="Learn more about EasyGIFMaker.com, our mission to provide a simple and powerful free online video to GIF converter, and the technology behind it." />
      </Helmet>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size={{ base: 'lg', md: 'xl' }} textAlign="center" color={headingColor}>
          About EasyGIFMaker.com
        </Heading>

        <Box>
          <Heading as="h2" size={{ base: 'md', md: 'lg' }} mb={3} color={headingColor}>
            Our Mission
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
            At EasyGIFMaker.com, our mission is to provide a fast, free, and user-friendly platform for anyone to convert their video clips into high-quality animated GIFs or short MP4s. We believe that creating engaging visual content shouldn't be complicated or require expensive software.
          </Text>
        </Box>

        <Box>
          <Heading as="h2" size={{ base: 'md', md: 'lg' }} mb={3} color={headingColor}>
            What We Offer
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
            EasyGIFMaker.com is packed with features to help you create the perfect GIF:
          </Text>
          <Text as="ul" listStyleType="disc" pl={5} mt={2} color={textColor} fontSize={{ base: 'sm', md: 'md'}}>
            <li>Convert MP4, YouTube URLs, and other video formats.</li>
            <li>Precise video trimming and scene detection aids.</li>
            <li>Customize FPS, output width, and audio inclusion.</li>
            <li>Visual and numerical cropping tools.</li>
            <li>Add text overlays with various styling options.</li>
            <li>Adjust playback speed and reverse your clips.</li>
            <li>Quick presets for common use cases.</li>
          </Text>
        </Box>

        {/* Add more sections as needed: Our Story, The Team (optional), Technology, etc. */}

      </VStack>
    </Box>
  );
}

export default AboutPage;