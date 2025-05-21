import React, { useState } from 'react';
import {
  Box, Heading, Text, VStack, FormControl, FormLabel, Input, Textarea, Button, useToast, useColorModeValue
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios'; // Make sure axios is imported

function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const headingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const formBgColor = useColorModeValue('white', 'gray.750'); // A slightly different dark mode bg for the form

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get the API URL from environment variables or use a default
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Make an API call to your backend endpoint (e.g., /api/contact)
      await axios.post(`${apiUrl}/api/contact`, { // Ensure this matches your backend route
        name,
        email,
        message,
      });

      toast({
        title: 'Message Sent!',
        description: "Thanks for reaching out. We'll get back to you soon.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // Clear the form
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error("Error sending contact message:", error);
      toast({
        title: 'Error Sending Message',
        description: error.response?.data?.message || "Something went wrong. Please try again later.", // Use error.response.data.message if your backend sends it
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={{ base: 4, md: 8 }} maxW="container.md" mx="auto">
      <Helmet>
        <title>Contact Us - EasyGIFMaker.com</title>
        <meta name="description" content="Get in touch with the EasyGIFMaker.com team. We'd love to hear your feedback, questions, or suggestions." />
      </Helmet>
      <Heading as="h1" size={{ base: 'lg', md: 'xl' }} textAlign="center" mb={{ base: 6, md: 10 }} color={headingColor}>
        Contact Us
      </Heading>
      <Box bg={formBgColor} p={{base: 4, sm: 6, md: 8}} borderRadius="lg" shadow="md">
        <Text mb={6} color={textColor}>
          Have questions, feedback, or suggestions? We'd love to hear from you! Please fill out the form below, and we'll get back to you as soon as possible.
        </Text>
        <form onSubmit={handleSubmit}>
          <VStack spacing={5}>
            <FormControl isRequired id="contact-name">
              <FormLabel htmlFor="contact-name" color={textColor}>Your Name</FormLabel>
              <Input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                focusBorderColor="blue.500" 
                autoComplete="name"
              />
            </FormControl>
            <FormControl isRequired id="contact-email">
              <FormLabel htmlFor="contact-email" color={textColor}>Your Email</FormLabel>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                focusBorderColor="blue.500" 
                autoComplete="email"
              />
            </FormControl>
            <FormControl isRequired id="contact-message">
              <FormLabel htmlFor="contact-message" color={textColor}>Message</FormLabel>
              <Textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                placeholder="Your message..." 
                rows={5} 
                focusBorderColor="blue.500" 
              />
            </FormControl>
            <Button 
              type="submit" 
              colorScheme="blue" 
              size="lg" 
              isLoading={isLoading} 
              loadingText="Sending..."
              w="full"
            >
              Send Message
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}

export default ContactPage;
