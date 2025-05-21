import React from 'react';
import { Box, Flex, Heading, Link as ChakraLink, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

function Navbar() {
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box bg={bgColor} px={{ base: 4, md: 8 }} py={3} shadow="sm" borderBottom="1px" borderColor={borderColor}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'} maxW="container.xl" mx="auto">
        <ChakraLink as={RouterLink} to="/" _hover={{ textDecoration: 'none' }} title="EasyGIFMaker.com Home">
          <Heading as="h1" size="lg" color={textColor} letterSpacing={'tighter'}>
            EasyGIFMaker.com
          </Heading>
        </ChakraLink>

        {/* You can add other navigation links here if needed in the future */}
        {/* <Stack direction={'row'} spacing={7}>
          <ChakraLink as={RouterLink} to="/features">Features</ChakraLink>
          <ChakraLink as={RouterLink} to="/pricing">Pricing</ChakraLink>
        </Stack> */}
      </Flex>
    </Box>
  );
}

export default Navbar;