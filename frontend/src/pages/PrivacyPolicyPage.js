import React from 'react';
import { Box, Heading, Text, VStack, UnorderedList, ListItem, useColorModeValue } from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';

function PrivacyPolicyPage() {
  const headingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const lastUpdated = "October 28, 2023"; // Update this date

  return (
    <Box p={{ base: 4, md: 8 }} maxW="container.lg" mx="auto">
      <Helmet>
        <title>Privacy Policy - EasyGIFMaker.com</title>
        <meta name="description" content="Read the Privacy Policy for EasyGIFMaker.com to understand how we handle your data and protect your privacy when you use our video to GIF conversion service." />
      </Helmet>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" color={headingColor}>
          Privacy Policy for EasyGIFMaker.com
        </Heading>
        <Text color={textColor}>Last Updated: {lastUpdated}</Text>

        <Text color={textColor}>
          Welcome to EasyGIFMaker.com (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
        </Text>

        <Box>
          <Heading as="h2" size="lg" my={4} color={headingColor}>
            Information We Collect
          </Heading>
          <Text color={textColor} mb={2}>
            We may collect information about you in a variety of ways. The information we may collect on the Service includes:
          </Text>
          <UnorderedList spacing={2} color={textColor} pl={5}>
            <ListItem>
              **Uploaded Files:** When you upload video files for conversion, these files are temporarily stored on our servers (or on AWS S3 as per our tech stack) for processing. We aim to delete these files from our active servers within a reasonable timeframe after the conversion process is completed or after a period of inactivity (e.g., 24 hours). We do not claim ownership of your content.
            </ListItem>
            <ListItem>
              **URL Submissions:** If you provide a URL for video processing, we will fetch the content from that URL for conversion. The same temporary storage and deletion policies apply.
            </ListItem>
            <ListItem>
              **Usage Data:** We may automatically collect standard log information and usage data when you access the Service, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Service. This data is used for analytics and to improve our service.
            </ListItem>
            <ListItem>
              **Contact Information:** If you contact us directly (e.g., via a contact form or email), we may receive additional information about you such as your name, email address, and the contents of the message and/or attachments you may send us.
            </ListItem>
          </UnorderedList>
        </Box>

        <Box>
          <Heading as="h2" size="lg" my={4} color={headingColor}>
            How We Use Your Information
          </Heading>
          <Text color={textColor} mb={2}>
            Having accurate information permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:
          </Text>
          <UnorderedList spacing={2} color={textColor} pl={5}>
            <ListItem>Provide, operate, and maintain our Service.</ListItem>
            <ListItem>Process your video conversions and deliver the output files.</ListItem>
            <ListItem>Improve, personalize, and expand our Service.</ListItem>
            <ListItem>Understand and analyze how you use our Service.</ListItem>
            <ListItem>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the Service, and for marketing and promotional purposes (if you opt-in).</ListItem>
            <ListItem>Prevent fraudulent transactions, monitor against theft, and protect against criminal activity.</ListItem>
            <ListItem>Comply with legal obligations.</ListItem>
          </UnorderedList>
        </Box>

        <Box>
          <Heading as="h2" size="lg" my={4} color={headingColor}>
            Security of Your Information
          </Heading>
          <Text color={textColor}>
            We use administrative, technical, and physical security measures to help protect your personal information and uploaded files. While we have taken reasonable steps to secure the information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" my={4} color={headingColor}>
            Changes to This Privacy Policy
          </Heading>
          <Text color={textColor}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </Text>
        </Box>

        <Box>
          <Heading as="h2" size="lg" my={4} color={headingColor}>
            Contact Us
          </Heading>
          <Text color={textColor}>
            If you have questions or comments about this Privacy Policy, please contact us through our <ChakraLink as={RouterLink} to="/contact" color="blue.500">Contact Page</ChakraLink>.
          </Text>
        </Box>
        {/* 
          IMPORTANT: This is a basic template. For a production website, 
          especially one handling user uploads, consult with a legal professional 
          or use a comprehensive privacy policy generator and tailor it to your 
          exact data handling practices, including details about AWS S3, ClamAV (if used), 
          data retention periods, cookies, third-party services, and user rights (GDPR, CCPA, etc.).
        */}
      </VStack>
    </Box>
  );
}

export default PrivacyPolicyPage;