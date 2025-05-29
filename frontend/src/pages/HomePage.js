import React from 'react';
import {
  Box, Heading, Text, VStack, Center, useColorModeValue,
  List, ListItem, ListIcon, Divider, Link as ChakraLink
} from '@chakra-ui/react';
import Upload from '../components/Upload'; // Your main upload component
import { FiUpload, FiCrop, FiType, FiSettings, FiSmile, FiZap, FiFilm, FiMessageSquare } from 'react-icons/fi'; // Added more icons
import { Helmet } from 'react-helmet-async'; // For setting page title and meta description

function HomePage() {
  const pageBg = useColorModeValue('gray.50', 'gray.850'); // Slightly darker than footer for contrast if needed
  const headingColor = useColorModeValue('gray.800', 'whiteAlpha.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const sectionBg = useColorModeValue('white', 'gray.750');
  const sectionHeadingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const featureListItemBg = useColorModeValue('gray.50', 'gray.700'); // Background for feature list items

  return (
    <Box bg={pageBg} flexGrow={1}> {/* Ensure it takes up space */}
      <Helmet>
        {/* Primary Meta Tags */}
        <title>MP4 to GIF Converter Online – Trim, Crop, Convert & Customize</title>
        <meta name="description" content="Convert MP4 videos and YouTube links into high-quality GIFs or short MP4 clips. Trim, crop, overlay text, and customize easily with our free online converter." />
        <meta name="keywords" content="mp4 to gif, video to gif, convert mp4 online, crop video online, youtube to gif, trim mp4, gif editor online, add text to gif, reverse video, short clip converter" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.easygifmaker.com/" /> {/* Replace with your actual domain */}
        <meta property="og:title" content="MP4 to GIF & Short Video Converter Online" />
        <meta property="og:description" content="Free online tool to convert, trim, crop, and edit MP4 or YouTube videos into GIFs and short clips. No watermark." />
        <meta property="og:image" content="https://www.easygifmaker.com/og-image.jpg" /> {/* Replace with your actual OG image URL */}
        <meta property="og:site_name" content="EasyGIFMaker.com" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.easygifmaker.com/" /> {/* Replace with your actual domain */}
        <meta name="twitter:title" content="Convert MP4 to GIF or Short Clip Online" />
        <meta name="twitter:description" content="Trim, crop, and add text to videos. Create custom GIFs and clips for free!" />
        <meta name="twitter:image" content="https://www.easygifmaker.com/twitter-image.jpg" /> {/* Replace with your actual Twitter image URL */}
        {/* <meta name="twitter:site" content="@YourTwitterHandle" /> */} {/* Optional: Add your Twitter handle */}

        {/* Canonical Tag */}
        <link rel="canonical" href="https://www.easygifmaker.com/" /> {/* Replace with your actual domain */}

        {/* Structured Data (JSON-LD) */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "EasyGIFMaker.com - MP4 to GIF Converter",
              "url": "https://www.easygifmaker.com/",
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "All (Web-based)",
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "USD"
              },
              "description": "Convert MP4 and YouTube videos into GIFs or short MP4 clips. Trim, crop, reverse, and add overlays with our free online tool.",
              "publisher": {
                "@type": "Organization",
                "name": "EasyGIFMaker.com"
              }
            }
          `}
        </script>
      </Helmet>
      <VStack spacing={4} mb={{ base: 6, md: 8 }} pt={{ base: 4, md: 8 }}> {/* Added pt to give some space from top if no navbar */}
        <Heading as="h1" size={{ base: 'xl', md: '2xl' }} color={headingColor} textAlign="center">
          EasyGIFMaker.com
        </Heading>
        <Text fontSize={{ base: 'md', md: 'lg' }} color={textColor} textAlign="center" px={4}>
          Your free online tool to effortlessly convert MP4s & videos to animated GIFs and short MP4 clips.
        </Text>
      </VStack>
      <Center pb={{ base: 6, md: 8 }} flexDirection="column" px={{ base: 2, md: 0 }}> {/* Added px for small padding on mobile */}
        <Upload />

        {/* Quick Tips Section */}
        <Box mt={{ base: 8, md: 12 }} p={{ base: 4, md: 6 }} bg={sectionBg} borderRadius="lg" shadow="md" w="full" maxW={{ base: "full", md: "2xl" }}>
          <Heading as="h3" size={{ base: 'md', md: 'lg' }} mb={4} color={sectionHeadingColor} textAlign="center">
            Quick Tips for Best Results
          </Heading>
          <List spacing={5} color={textColor} fontSize={{ base: 'sm', md: 'md' }}>
            <ListItem display="flex" alignItems="flex-start">
              <ListIcon as={() => <Text as="span" fontSize="xl" role="img" aria-label="idea emoji">💡</Text>} color="yellow.500" mr={3} mt="1px" />
              <Box flex="1">
                <strong>Optimize GIF Size:</strong> For smaller, web-friendly GIFs, try reducing the FPS (Frames Per Second) to around 10-15, or lower the output width in the "Output" settings. This significantly impacts file size without always sacrificing too much quality.
              </Box>
            </ListItem>
            <ListItem display="flex" alignItems="flex-start">
              <ListIcon as={() => <Text as="span" fontSize="xl" role="img" aria-label="scissors emoji">✂️</Text>} color="blue.500" mr={3} mt="1px" />
              <Box flex="1">
                <strong>Precise Trimming:</strong> Use the "Trim" feature to select only the most impactful part of your video. Shorter clips make for smaller and more focused GIFs. Our scene detection markers can help you find natural break points!
              </Box>
            </ListItem>
            <ListItem display="flex" alignItems="flex-start">
              <ListIcon as={() => <Text as="span" fontSize="xl" role="img" aria-label="frame emoji">🖼️</Text>} color="green.500" mr={3} mt="1px" />
              <Box flex="1">
                <strong>Focus with Crop:</strong> The "Crop" tool (both visual and numerical) is perfect for focusing on a specific area of your video, removing unwanted black bars, or changing the aspect ratio. Try our preset aspect ratios for common sizes like 16:9 or 1:1 (square).
              </Box>
            </ListItem>
            <ListItem display="flex" alignItems="flex-start">
              <ListIcon as={() => <Text as="span" fontSize="xl" role="img" aria-label="writing emoji">✍️</Text>} color="purple.500" mr={3} mt="1px" />
              <Box flex="1">
                <strong>Add Context with Text:</strong> Add personality or context with "Text Overlay." Experiment with different fonts, colors, background colors, and positions to make your message clear and visually appealing.
              </Box>
            </ListItem>
            <ListItem display="flex" alignItems="flex-start">
              <ListIcon as={() => <Text as="span" fontSize="xl" role="img" aria-label="rocket emoji">🚀</Text>} color="orange.500" mr={3} mt="1px" />
              <Box flex="1">
                <strong>Speed Up with Presets:</strong> Check out "Quick Presets" for common configurations like "High-Quality GIF" or "Small Email GIF" if you're in a hurry. You can always switch to "Default (Custom)" to fine-tune every detail.
              </Box>
            </ListItem>
            <ListItem display="flex" alignItems="flex-start">
              <ListIcon as={() => <Text as="span" fontSize="xl" role="img" aria-label="arrows counterclockwise emoji">🔄</Text>} color="teal.500" mr={3} mt="1px" />
              <Box flex="1">
                <strong>Experiment with Effects:</strong> Try the "Speed Factor" to create slow-motion or fast-forward effects. The "Reverse" option can lead to some fun and surprising results!
              </Box>
            </ListItem>
            <ListItem display="flex" alignItems="flex-start">
              <ListIcon as={() => <Text as="span" fontSize="xl" role="img" aria-label="clapper board emoji">🎬</Text>} color="pink.500" mr={3} mt="1px" />
              <Box flex="1">
                <strong>Consider MP4 for Sound & Length:</strong> If your clip needs audio or is longer than a typical GIF, consider enabling "Include Audio" which will output a short MP4. MP4s offer better quality for longer clips and support sound.
              </Box>
            </ListItem>
          </List>
        </Box>

        <Divider my={{ base: 6, md: 10 }} maxW={{ base: "90%", md: "2xl" }} />

        {/* About the Tool Section */}
        <Box p={{ base: 4, md: 6 }} w="full" maxW={{ base: "full", md: "2xl" }} textAlign="left"> {/* Changed to textAlign="left" for better readability of longer text */}
          <Heading as="h3" size={{ base: 'md', md: 'lg' }} mb={3} color={sectionHeadingColor}>
            More Than Just a Converter
          </Heading>
          <Text color={textColor} fontSize={{ base: 'sm', md: 'md' }} mb={3}>
            EasyGIFMaker.com is designed to be your go-to online solution for all things video-to-GIF and short-form video editing. We understand that creating the perfect animated clip involves more than just a simple conversion. That's why we've packed our tool with a comprehensive suite of features, giving you granular control over your output.
          </Text>
          <Text color={textColor} fontSize={{ base: 'sm', md: 'md' }} mb={3}>
            Whether you're looking to capture a hilarious moment, create an engaging social media post, or design a custom emoji, EasyGIFMaker empowers you with:
          </Text>
          <List spacing={4} color={textColor} fontSize={{ base: 'sm', md: 'md' }} mb={4}>
            <ListItem
              display="flex" alignItems="flex-start"
              bg={featureListItemBg} p={3} borderRadius="md"
            >
              <ListIcon as={FiUpload} color="blue.500" boxSize={5} mr={3} mt="1px" />
              <Box flex="1">
                <strong>Flexible Input:</strong> Upload local files or directly process videos from URLs (including YouTube).
              </Box>
            </ListItem>
            <ListItem
              display="flex" alignItems="flex-start"
              bg={featureListItemBg} p={3} borderRadius="md"
            >
              <ListIcon as={FiCrop} color="green.500" boxSize={5} mr={3} mt="1px" />
              <Box flex="1">
                <strong>Precision Editing:</strong> Fine-tune start/end times with our slider and scene detection, crop to the perfect frame with visual and numerical inputs, and choose from various aspect ratios.
              </Box>
            </ListItem>
            <ListItem
              display="flex" alignItems="flex-start"
              bg={featureListItemBg} p={3} borderRadius="md"
            >
              <ListIcon as={FiType} color="purple.500" boxSize={5} mr={3} mt="1px" />
              <Box flex="1">
                <strong>Creative Customization:</strong> Add expressive text overlays with full control over font, size, color, background, and position. Adjust playback speed for dramatic or comedic effect, or even reverse your clip.
              </Box>
            </ListItem>
            <ListItem
              display="flex" alignItems="flex-start"
              bg={featureListItemBg} p={3} borderRadius="md"
            >
              <ListIcon as={FiSettings} color="orange.500" boxSize={5} mr={3} mt="1px" />
              <Box flex="1">
                <strong>Output Control:</strong> Manage FPS, output width, and decide whether to include audio (for MP4 output). Our presets offer quick starting points for common needs.
              </Box>
            </ListItem>
            <ListItem
              display="flex" alignItems="flex-start"
              bg={featureListItemBg} p={3} borderRadius="md"
            >
              <ListIcon as={FiSmile} color="teal.500" boxSize={5} mr={3} mt="1px" />
              <Box flex="1">
                <strong>User-Friendly Interface:</strong> We strive for an intuitive experience, making powerful features accessible to everyone, all within your browser and completely free.
              </Box>
            </ListItem>
          </List>
          <Text color={textColor} fontSize={{ base: 'sm', md: 'md' }} mb={4}>
            Our goal is to provide a robust, reliable, and easy-to-use tool that helps you bring your video moments to life as dynamic GIFs or concise MP4s.
          </Text>
          <ChakraLink href="/about" color="blue.500" fontWeight="semibold">Learn more about our features &rarr;</ChakraLink>
        </Box>
      </Center>
    </Box>
  );
}

export default HomePage;