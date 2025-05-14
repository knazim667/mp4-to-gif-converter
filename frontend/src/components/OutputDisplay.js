import React from 'react';
import {
  Box,
  Heading,
  Center,
  Image,
  Link,
  Button,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUploadCloud } from 'react-icons/fi';
import VideoPlayer from './VideoPlayer'; // Assuming VideoPlayer is in the same directory or adjust path

function OutputDisplay({ outputUrl, outputFormat, liveTextOverlay }) {
  const gifResultBoxBg = useColorModeValue('gray.50', 'gray.700');
  const resultHeadingColor = useColorModeValue('purple.600', 'purple.300');

  if (!outputUrl) {
    return null;
  }

  return (
    <Box mt={10} p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg" shadow="xl" bg={gifResultBoxBg}>
      <Heading as="h3" size="lg" mb={6} textAlign="center" color={resultHeadingColor}>
        Your {outputFormat.toUpperCase()} is Ready!
      </Heading>
      <Box borderRadius="md" overflow="hidden">
        <Center>
          {outputFormat === 'mp4' ? (
            <VideoPlayer
              key={outputUrl} // Re-key to ensure player re-initializes if URL changes
              src={outputUrl}
              onMetadataLoaded={() => {}} // Dummy or actual handler if needed
              liveTextOverlay={liveTextOverlay} // Pass null if no live overlay for final output
            />
          ) : (
            <Image src={outputUrl} alt={`Converted ${outputFormat.toUpperCase()}`} maxW="full" borderRadius="md" />
          )}
        </Center>
      </Box>
      <Link href={outputUrl} download isExternal _hover={{ textDecoration: 'none' }}>
        <Button colorScheme="teal" size="lg" w="full" mt={6} leftIcon={<Icon as={FiUploadCloud} transform="rotate(180deg)" />}>
          Download {outputFormat.toUpperCase()}
        </Button>
      </Link>
    </Box>
  );
}

export default OutputDisplay;