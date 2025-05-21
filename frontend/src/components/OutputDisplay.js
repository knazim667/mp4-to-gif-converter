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
import VideoPlayer from './VideoPlayer';

function OutputDisplay({ outputUrl, outputFormat, liveTextOverlay }) {
  const gifResultBoxBg = useColorModeValue('gray.50', 'gray.700');
  const resultHeadingColor = useColorModeValue('purple.600', 'purple.300');

  if (!outputUrl) {
    return null;
  }

  return (
    <Box mt={{ base: 6, md: 10 }} p={{ base: 3, md: 6 }} borderWidth="1px" borderRadius="lg" shadow="xl" bg={gifResultBoxBg}>
      <Heading as="h3" size={{ base: 'md', md: 'lg' }} mb={{ base: 4, md: 6 }} textAlign="center" color={resultHeadingColor}>
        Your {outputFormat ? outputFormat.toUpperCase() : 'Output'} is Ready! {/* Added check for outputFormat */}
      </Heading>
      <Box borderRadius="md" overflow="hidden" maxW="100%">
        <Center>
          {/* Assume VideoPlayer and Image handle invalid URLs gracefully */}
          {outputFormat === 'mp4' ? (
            <VideoPlayer
              key={outputUrl}
              src={outputUrl || ''} // Pass empty string if null to VideoPlayer
              onMetadataLoaded={() => {}}
              liveTextOverlay={liveTextOverlay}
            />
          ) : (
            <Image src={outputUrl || ''} alt={`Converted ${outputFormat ? outputFormat.toUpperCase() : 'Output'}`} maxW="100%" h="auto" borderRadius="md" />
          )}
        </Center>
      </Box>
       {/* Only show download button if outputUrl is valid */}
      {outputUrl && (
          <Link href={outputUrl} download isExternal _hover={{ textDecoration: 'none' }} display="block" w="full">
            <Button colorScheme="teal" size="lg" w="full" mt={6} leftIcon={<Icon as={FiUploadCloud} transform="rotate(180deg)" />}>
              Download {outputFormat ? outputFormat.toUpperCase() : 'Output'}
            </Button>
          </Link>
      )}
    </Box>
  );
}

export default OutputDisplay;