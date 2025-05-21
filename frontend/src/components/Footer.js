import React from 'react';
import { Box, Flex, Link as ChakraLink, Text, Stack, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

function Footer() {
  const bgColor = useColorModeValue('gray.100', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  return (
    <Box bg={bgColor} color={textColor} py={{ base: 4, md: 6 }} mt={{ base: 6, md: 10 }}>
      <Flex
        align={'center'}
        _before={{
          content: '""',
          borderBottom: '1px solid',
          borderColor: useColorModeValue('gray.200', 'gray.700'),
          flexGrow: 1,
          mr: { base: 4, md: 8 },
        }}
        _after={{
          content: '""',
          borderBottom: '1px solid',
          borderColor: useColorModeValue('gray.200', 'gray.700'),
          flexGrow: 1,
          ml: { base: 4, md: 8 },
        }}>
        <Text pt={2} fontSize={'sm'} textAlign={'center'}>
          © {new Date().getFullYear()} EasyGIFMaker.com. All rights reserved.
        </Text>
      </Flex>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={{ base: 2, md: 4 }} justify="center" align="center" mt={4} fontSize={{ base: 'sm', md: 'md'}}>
        <ChakraLink as={RouterLink} to="/" p={1}>EasyGIFMaker Tool</ChakraLink>
        <ChakraLink as={RouterLink} to="/about" p={1}>About Us</ChakraLink>
        <ChakraLink as={RouterLink} to="/contact" p={1}>Contact</ChakraLink>
        <ChakraLink as={RouterLink} to="/help/faq" p={1}>Help/FAQ</ChakraLink>
        <ChakraLink as={RouterLink} to="/privacy-policy" p={1}>Privacy Policy</ChakraLink>
      </Stack>
    </Box>
  );
}

export default Footer;