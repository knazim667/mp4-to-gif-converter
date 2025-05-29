import React from 'react';
import { Box, Heading, Text, VStack, OrderedList, ListItem, Code, useColorModeValue, UnorderedList, Container } from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';

function GuideAddTextToGIF() {
  const headingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Container maxW="container.lg" py={{ base: 6, md: 12 }}>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>How to Add Text to GIFs - EasyGIFMaker.com Guide</title>
        <meta name="description" content="Learn how to easily add and customize text overlays on your animated GIFs using EasyGIFMaker.com's powerful online editor." />
        <meta name="keywords" content="add text to gif, text overlay gif, customize gif text, gif editor guide, online gif text" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://www.easygifmaker.com/guides/adding-text-to-gifs" /> {/* Replace with your actual domain */}
        <meta property="og:title" content="How to Add Text to GIFs - EasyGIFMaker.com Guide" />
        <meta property="og:description" content="A step-by-step guide on adding and styling text on your animated GIFs with EasyGIFMaker.com." />
        {/* <meta property="og:image" content="https://www.easygifmaker.com/og-image-guide-addtext.jpg" /> */} {/* Optional: Add a specific OG image */}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.easygifmaker.com/guides/adding-text-to-gifs" /> {/* Replace with your actual domain */}
        <meta name="twitter:title" content="Guide: Adding Text to Your GIFs with EasyGIFMaker" />
        <meta name="twitter:description" content="Learn to add custom text overlays to your GIFs easily and for free online." />
        {/* <meta name="twitter:image" content="https://www.easygifmaker.com/twitter-image-guide-addtext.jpg" /> */} {/* Optional: Add a specific Twitter image */}

        {/* Canonical Tag */}
        <link rel="canonical" href="https://www.easygifmaker.com/guides/adding-text-to-gifs" /> {/* Replace with your actual domain */}
      </Helmet>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size={{ base: 'lg', md: 'xl' }} textAlign="center" color={headingColor}>
          Adding Text to Your GIFs with EasyGIFMaker.com
        </Heading>

        <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor}>
          Adding text overlays can make your GIFs more engaging and informative. Here’s how to do it with EasyGIFMaker.com:
        </Text>

        <OrderedList spacing={5} color={textColor} stylePosition="inside" fontSize={{ base: 'sm', md: 'md' }}>
          <ListItem>
            <Text fontWeight="semibold" display="inline">Upload or Process Your Video:</Text> Start by uploading your video file or processing a video URL as you normally would.
          </ListItem>
          <ListItem>
            <Text fontWeight="semibold" display="inline">Navigate to Text Overlay Settings:</Text> After your video is analyzed, the conversion settings will appear. Click on the "Text Overlay" tab.
          </ListItem>
          <ListItem>
            <Text fontWeight="semibold" display="inline">Enter Your Text:</Text> In the "Text" input field, type the message you want to display on your GIF.
          </ListItem>
          <ListItem>
            <Text fontWeight="semibold" display="inline">Customize Your Text:</Text> You have several options to style your text:
            <UnorderedList styleType="circle" pl={6} mt={1}>
              <ListItem><strong>Font Size:</strong> Adjust the size of your text.</ListItem>
              <ListItem><strong>Font Style:</strong> Choose from a list of available fonts.</ListItem>
              <ListItem><strong>Text Color:</strong> Pick a color for your text (e.g., "white", "#FF0000").</ListItem>
              <ListItem><strong>Background Color (Optional):</strong> Add a background color to your text for better visibility.</ListItem>
              <ListItem><strong>Position:</strong> Select where you want the text to appear (e.g., Center, Top Left, Bottom Right).</ListItem>
            </UnorderedList>
            You'll see a live preview of the text overlay on the video player (when not in visual crop mode).
          </ListItem>
          <ListItem>
            <Text fontWeight="semibold" display="inline">Convert Your GIF:</Text> After configuring your text and any other settings (like trim, crop, etc.), click the "Convert to GIF" button.
          </ListItem>
          <ListItem>
            <Text fontWeight="semibold" display="inline">Preview and Download:</Text> Your GIF with the text overlay will be generated. Preview it and then download your creation!
          </ListItem>
        </OrderedList>

        <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor} mt={4}>
          Experiment with different styles and positions to make your text stand out!
        </Text>
      </VStack>
    </Container>
  );
}

export default GuideAddTextToGIF;