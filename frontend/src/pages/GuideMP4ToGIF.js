import React from 'react';
import { Box, Heading, Text, VStack, OrderedList, ListItem, UnorderedList, useColorModeValue, Container } from '@chakra-ui/react'; // Added UnorderedList and Container
import { Helmet } from 'react-helmet-async';

function GuideMP4ToGIF() {
  const headingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  // const codeBgColor = useColorModeValue('gray.100', 'gray.700'); // Not used in this file
  const pageUrl = "https://www.easygifmaker.com/guides/how-to-convert-mp4-to-gif"; // Define pageUrl - Replace with your actual domain

  return (
    <Container maxW="container.lg" py={{ base: 6, md: 12 }}>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>How to Convert MP4 to GIF Online Free | EasyGIFMaker Guide</title>
        <meta name="description" content="Step-by-step guide to easily convert your MP4 videos to animated GIFs using EasyGIFMaker.com's free online tool. Learn to trim, customize, and download." />
        <meta name="keywords" content="how to convert mp4 to gif, mp4 to gif guide, online gif converter steps, free mp4 to gif, video to gif tutorial" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content="How to Convert MP4 to GIF Online Free | EasyGIFMaker Guide" />
        <meta property="og:description" content="Learn the simple steps to turn MP4s into animated GIFs with our free online converter." />
        {/* <meta property="og:image" content="https://www.easygifmaker.com/og-image-guide-mp4togif.jpg" /> */} {/* Optional: Add a specific OG image */}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content="Easy MP4 to GIF Conversion Guide" />
        <meta name="twitter:description" content="Follow our guide to convert MP4 to GIF for free online." />
        {/* <meta name="twitter:image" content="https://www.easygifmaker.com/twitter-image-guide-mp4togif.jpg" /> */} {/* Optional: Add a specific Twitter image */}

        {/* Canonical Tag */}
        <link rel="canonical" href={pageUrl} />

        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "HowTo",
              "name": "How to Convert MP4 to GIF using EasyGIFMaker.com",
              "description": "A step-by-step guide to converting MP4 video files to animated GIFs online for free.",
              "step": [
                {
                  "@type": "HowToStep",
                  "name": "Upload Video",
                  "text": "Upload your MP4 file or paste a video URL into EasyGIFMaker.com."
                },
                {
                  "@type": "HowToStep",
                  "name": "Adjust Settings",
                  "text": "Use the trim, crop, text overlay, and other settings to customize your GIF."
                },
                {
                  "@type": "HowToStep",
                  "name": "Convert",
                  "text": "Click the convert button to process your video into a GIF."
                },
                {
                  "@type": "HowToStep",
                  "name": "Download",
                  "text": "Preview and download your newly created animated GIF."
                }
              ]
            }
          `}
        </script>
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
    </Container>
  );
}

export default GuideMP4ToGIF;