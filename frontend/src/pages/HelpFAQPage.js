import React from 'react';
import {
  Box, Heading, Text, VStack, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, useColorModeValue, Link as ChakraLink
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink } from 'react-router-dom'; // Import RouterLink


const faqs = [
  {
    question: 'What video formats can I upload?',
    answer: 'EasyGIFMaker.com supports MP4, AVI, MOV, WEBM, and MKV video formats. You can also provide URLs from platforms like YouTube and Vimeo.',
  },
  {
    question: 'How do I trim a video?',
    answer: 'After your video is processed, go to the "Trim" tab. You can use the visual slider or input exact start and end times to select the portion of the video you want to convert.',
  },
  {
    question: 'Can I add text to my GIF?',
    answer: 'Yes! Navigate to the "Text Overlay" tab. You can enter your desired text, customize its font size, style, color, background color, and position on the GIF.',
  },
  {
    question: 'How do I change the speed of my GIF?',
    answer: 'In the "Effects" tab, you can adjust the "Speed Factor." Values less than 1.0 will slow down the GIF, and values greater than 1.0 will speed it up.',
  },
  {
    question: 'Is EasyGIFMaker.com free to use?',
    answer: 'Yes, EasyGIFMaker.com is completely free to use for converting your videos to GIFs and short MP4 clips.',
  },
  {
    question: 'What are "Quick Presets"?',
    answer: 'Quick Presets are pre-defined settings for common use cases like "High-Quality GIF" or "Small Email GIF". They help you quickly apply a set of conversion options. You can always switch to "Default (Custom)" to fine-tune all settings manually.',
  },
  // Add more FAQs as needed
];

function HelpFAQPage() {
  const headingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.800');
  const panelBgColor = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box p={{ base: 4, md: 8 }} maxW="container.lg" mx="auto">
      <Helmet>
        <title>Help & FAQ - EasyGIFMaker.com</title>
        <meta name="description" content="Find answers to frequently asked questions about using EasyGIFMaker.com. Learn how to convert videos, trim, add text, and use other features." />
      </Helmet>
      <Heading as="h1" size="xl" textAlign="center" mb={10} color={headingColor}>
        Help & Frequently Asked Questions
      </Heading>

      <Accordion allowMultiple>
        {faqs.map((faq, index) => (
          <AccordionItem key={index} mb={4} border="none">
            <h2>
              <AccordionButton
                _expanded={{ bg: useColorModeValue('blue.500', 'blue.600'), color: 'white' }}
                bg={useColorModeValue('gray.100', 'gray.600')}
                borderRadius="md"
                p={4}
              >
                <Box flex="1" textAlign="left" fontWeight="semibold">
                  {faq.question}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4} pt={3} bg={panelBgColor} borderRadius="md" color={textColor}>
              {faq.answer}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      <Text mt={10} textAlign="center" color={textColor}>
        Can't find an answer? <ChakraLink as={RouterLink} to="/contact" color="blue.500">Contact us</ChakraLink>!
      </Text>
    </Box>
  );
}

export default HelpFAQPage;