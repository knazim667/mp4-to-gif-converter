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
        {/* Primary Meta Tags */}
        <title>About EasyGIFMaker.com | Our Mission & Features</title>
        <meta name="description" content="Learn about EasyGIFMaker.com - your free online tool for converting MP4s to GIFs, trimming videos, adding text, and more. Discover our mission and features." />
        <meta name="keywords" content="about easygifmaker, video to gif tool, online gif converter features, free video editor" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.easygifmaker.com/about" /> {/* Replace with your actual domain */}
        <meta property="og:title" content="About EasyGIFMaker.com | Our Mission & Features" />
        <meta property="og:description" content="Discover the story and features behind EasyGIFMaker.com, the free online MP4 to GIF and short video converter." />
        <meta property="og:image" content="https://www.easygifmaker.com/og-image-about.jpg" /> {/* Replace with a relevant OG image */}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.easygifmaker.com/about" /> {/* Replace with your actual domain */}
        <meta name="twitter:title" content="About EasyGIFMaker.com | Our Mission & Features" />
        <meta name="twitter:description" content="Learn more about EasyGIFMaker.com and how we make video to GIF conversion easy and free." />
        <meta name="twitter:image" content="https://www.easygifmaker.com/twitter-image-about.jpg" /> {/* Replace with a relevant Twitter image */}

        {/* Canonical Tag */}
        <link rel="canonical" href="https://www.easygifmaker.com/about" /> {/* Replace with your actual domain */}
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