import React, { useState, useRef } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
import TrimSlider from './TrimSlider';
import { 
  Box, Heading, Text, VStack, Button, Input, FormControl, FormLabel, 
  SimpleGrid, Center, Image, Link, useColorModeValue 
} from '@chakra-ui/react';

function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [gifUrl, setGifUrl] = useState('');
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(320);
  const [trim, setTrim] = useState({ start: 0, end: null });
  const [videoDuration, setVideoDuration] = useState(0);
  const [scenePoints, setScenePoints] = useState([]); // New state for scene points
  const fileInputRef = useRef(null);

  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const dragBg = useColorModeValue('blue.50', 'blue.900');
  const hoverBorder = useColorModeValue('blue.400', 'blue.500');

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && ['video/mp4', 'video/avi', 'video/quicktime'].includes(selectedFile.type)) {
      setFile(selectedFile);
      setMessage('');
      setUploadedFilename('');
      setGifUrl('');
      setTrim({ start: 0, end: null });
      setScenePoints([]); // Reset scene points
      const video = document.createElement('video');
      video.src = URL.createObjectURL(selectedFile);
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
        setTrim({ start: 0, end: video.duration });
        URL.revokeObjectURL(video.src);
      };
    } else {
      setFile(null);
      setMessage('Please select a valid MP4, AVI, or MOV file.');
    }
  };

  // Handle drag-and-drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && ['video/mp4', 'video/avi', 'video/quicktime'].includes(droppedFile.type)) {
      setFile(droppedFile);
      setMessage('');
      setUploadedFilename('');
      setGifUrl('');
      setTrim({ start: 0, end: null });
      setScenePoints([]); // Reset scene points
      const video = document.createElement('video');
      video.src = URL.createObjectURL(droppedFile);
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
        setTrim({ start: 0, end: video.duration });
        URL.revokeObjectURL(video.src);
      };
    } else {
      setFile(null);
      setMessage('Please drop a valid MP4, AVI, or MOV file.');
    }
  };

  // Handle upload and analyze
  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select or drop a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);

    try {
      setMessage('Uploading...');
      const uploadResponse = await axios.post(`${process.env.REACT_APP_API_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(`Success: Uploaded ${uploadResponse.data.filename}`);
      setUploadedFilename(uploadResponse.data.filename);

      // Analyze video for scene changes
      setMessage('Analyzing video...');
      const analyzeResponse = await axios.post(`${process.env.REACT_APP_API_URL}/analyze`, {
        filename: uploadResponse.data.filename,
      });
      setScenePoints(analyzeResponse.data.scenes); // Set scene points
      setMessage(`Success: Uploaded and analyzed ${uploadResponse.data.filename}`);

      setFile(null);
      fileInputRef.current.value = '';
    } catch (error) {
      setMessage(`Upload/Analysis failed: ${error.response?.data?.message || 'Server error'}`);
    }
  };

  // Handle conversion
  const handleConvert = async () => {
    if (!uploadedFilename) {
      setMessage('Please upload a file first.');
      return;
    }

    try {
      setMessage('Converting to GIF...');
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/convert`, {
        filename: uploadedFilename,
        fps,
        width,
        start: trim.start,
        end: trim.end
      });
      setMessage(`Success: Converted to ${response.data.filename}`);
      setGifUrl(response.data.url);
    } catch (error) {
      setMessage(`Conversion failed: ${error.response?.data?.message || 'Server error'}`);
    }
  };

  // Handle trim change
  const handleTrimChange = ({ start, end }) => {
    setTrim({ start, end });
  };

  return (
    <Box bg="white" borderRadius="xl" boxShadow="lg" p={{ base: 6, md: 8 }}>
      <Heading as="h2" size="lg" color="gray.800" mb={6}>
        Create Your GIF
      </Heading>

      {/* Upload Section */}
      <Box
        borderWidth={2}
        borderStyle="dashed"
        borderColor={isDragging ? 'blue.500' : borderColor}
        bg={isDragging ? dragBg : 'gray.50'}
        borderRadius="lg"
        p={8}
        textAlign="center"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        _hover={{ borderColor: hoverBorder }}
        transition="all 0.3s"
      >
        <Text color="gray.600" mb={4}>
          {file ? (
            <Text as="span" fontWeight="medium" color="blue.600">
              {file.name}
            </Text>
          ) : (
            'Drag & drop your video here or click to select'
          )}
        </Text>
        <Input
          type="file"
          accept=".mp4,.avi,.mov"
          onChange={handleFileChange}
          ref={fileInputRef}
          display="none"
          id="fileInput"
        />
        <Button
          as="label"
          htmlFor="fileInput"
          colorScheme="blue"
          size="md"
          borderRadius="full"
          cursor="pointer"
        >
          Select Video
        </Button>
      </Box>
      <Button
        onClick={handleUpload}
        isDisabled={!file}
        colorScheme="blue"
        size="lg"
        w="full"
        mt={6}
      >
        Upload Video
      </Button>

      {/* Video Preview */}
      {file && (
        <VideoPlayer src={URL.createObjectURL(file)} />
      )}

      {/* Conversion Settings */}
      {uploadedFilename && (
        <Box mt={8}>
          <Heading as="h3" size="md" color="gray.800" mb={4}>
            GIF Settings
          </Heading>
          <TrimSlider duration={videoDuration} scenes={scenePoints} onTrimChange={handleTrimChange} />
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mt={4}>
            <FormControl>
              <FormLabel fontSize="sm" color="gray.600">
                Frames Per Second
              </FormLabel>
              <Input
                type="number"
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                min="1"
                max="30"
                focusBorderColor="blue.500"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" color="gray.600">
                Width (px)
              </FormLabel>
              <Input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min="100"
                max="1280"
                focusBorderColor="blue.500"
              />
            </FormControl>
          </SimpleGrid>
          <Button
            onClick={handleConvert}
            colorScheme="coral"
            size="lg"
            w="full"
            mt={6}
          >
            Convert to GIF
          </Button>
        </Box>
      )}

      {/* Feedback Message */}
      {message && (
        <Text
          mt={6}
          textAlign="center"
          fontWeight="medium"
          color={message.includes('Success') ? 'green.600' : 'red.600'}
        >
          {message}
        </Text>
      )}

      {/* GIF Result */}
      {gifUrl && (
        <Box mt={8}>
          <Heading as="h3" size="md" color="gray.800" mb={4}>
            Your GIF
          </Heading>
          <Box bg="gray.50" borderRadius="lg" p={4}>
            <Center>
              <Image
                src={gifUrl}
                alt="Converted GIF"
                maxW="full"
                borderRadius="lg"
              />
            </Center>
            <Link href={gifUrl} download>
              <Button colorScheme="blue" size="lg" w="full" mt={4}>
                Download GIF
              </Button>
            </Link>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Upload;