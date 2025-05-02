import React from 'react';
import { Box, Heading, Text, VStack, Center } from '@chakra-ui/react';
import Upload from './components/Upload';

function App() {
  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <VStack spacing={4} mb={8}>
        <Heading as="h1" size={{ base: '2xl', md: '3xl' }} color="gray.800" textAlign="center">
          MP4 to GIF Converter
        </Heading>
        <Text fontSize="lg" color="gray.600" textAlign="center">
          Convert your videos to GIFs with ease
        </Text>
      </VStack>
      <Center>
        <Box w="full" maxW="2xl" px={4}>
          <Upload />
        </Box>
      </Center>
    </Box>
  );
}

export default App;
