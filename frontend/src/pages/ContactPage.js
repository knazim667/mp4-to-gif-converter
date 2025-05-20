import React, { useState } from 'react';
import {
  Box, Heading, Text, VStack, FormControl, FormLabel, Input, Textarea, Button, useToast, useColorModeValue
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';

function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const headingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const formBgColor = useColorModeValue('white', 'gray.750');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call for contact form
    // In a real app, you would send this data to your backend
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Message Sent!',
        description: "Thanks for reaching out. We'll get back to you soon.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setName('');
      setEmail('');
      setMessage('');
    }, 1500);
  };

  return (
    <Box p={{ base: 4, md: 8 }} maxW="container.md" mx="auto">
      <Helmet>
        <title>Contact Us - EasyGIFMaker.com</title>
        <meta name="description" content="Get in touch with the EasyGIFMaker.com team. We'd love to hear your feedback, questions, or suggestions." />
      </Helmet>
      <Heading as="h1" size="xl" textAlign="center" mb={10} color={headingColor}>
        Contact Us
      </Heading>
      <Box bg={formBgColor} p={8} borderRadius="lg" shadow="md">
        <Text mb={6} color={textColor}>
          Have questions, feedback, or suggestions? We'd love to hear from you! Please fill out the form below, and we'll get back to you as soon as possible.
        </Text>
        <form onSubmit={handleSubmit}>
          <VStack spacing={5}>
            <FormControl isRequired>
              <FormLabel htmlFor="name" color={textColor}>Your Name</FormLabel>
              <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} focusBorderColor="blue.500" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="email" color={textColor}>Your Email</FormLabel>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} focusBorderColor="blue.500" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor="message" color={textColor}>Message</FormLabel>
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your message..." rows={5} focusBorderColor="blue.500" />
            </FormControl>
            <Button type="submit" colorScheme="blue" size="lg" isLoading={isLoading} loadingText="Sending...">
              Send Message
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}

export default ContactPage;