import React from 'react';
import { Box, Flex, Link as ChakraLink, Text, Stack, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

function Footer() {
  const bgColor = useColorModeValue('gray.100', 'gray.900');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  return (
    <Box bg={bgColor} color={textColor} py={6} mt={10}>
      <Flex
        align={'center'}
        _before={{
          content: '""',
          borderBottom: '1px solid',
          borderColor: useColorModeValue('gray.200', 'gray.700'),
          flexGrow: 1,
          mr: 8,
        }}
        _after={{
          content: '""',
          borderBottom: '1px solid',
          borderColor: useColorModeValue('gray.200', 'gray.700'),
          flexGrow: 1,
          ml: 8,
        }}>
        <Text pt={2} fontSize={'sm'} textAlign={'center'}>
          © {new Date().getFullYear()} EasyGIFMaker.com. All rights reserved.
        </Text>
      </Flex>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={4} justify="center" align="center" mt={4}>
        <ChakraLink as={RouterLink} to="/about">About Us</ChakraLink>
        <ChakraLink as={RouterLink} to="/contact">Contact</ChakraLink>
        <ChakraLink as={RouterLink} to="/help/faq">Help/FAQ</ChakraLink>
        <ChakraLink as={RouterLink} to="/privacy-policy">Privacy Policy</ChakraLink>
      </Stack>
    </Box>
  );
}

export default Footer;