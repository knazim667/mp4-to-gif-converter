import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
import TrimSlider from './TrimSlider';
import { 
  Box, Heading, Text, VStack, Button, Input, FormControl, FormLabel, 
  SimpleGrid, Center, Image, Link, useColorModeValue, Select, Radio, RadioGroup, Stack 
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
  const [scenePoints, setScenePoints] = useState([]);
  const [textOverlay, setTextOverlay] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [textPosition, setTextPosition] = useState('center');
  const [videoSrc, setVideoSrc] = useState(null);
  const [textStyle, setTextStyle] = useState('default');
  const fileInputRef = useRef(null);

  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const dragBg = useColorModeValue('blue.50', 'blue.900');
  const hoverBorder = useColorModeValue('blue.400', 'blue.500');

  useEffect(() => {
    return () => {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && ['video/mp4', 'video/avi', 'video/quicktime'].includes(selectedFile.type)) {
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
      const newSrc = URL.createObjectURL(selectedFile);
      setVideoSrc(newSrc);
      setFile(selectedFile);
      setMessage('');
      setUploadedFilename('');
      setGifUrl('');
      setTrim({ start: 0, end: null });
      setScenePoints([]);
      const video = document.createElement('video');
      video.src = newSrc;
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
        setTrim({ start: 0, end: video.duration });
      };
    } else {
      setFile(null);
      setVideoSrc(null);
      setMessage('Please select a valid MP4, AVI, or MOV file.');
    }
  };

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
      if (videoSrc) {
        URL.revokeObjectURL(videoSrc);
      }
      const newSrc = URL.createObjectURL(droppedFile);
      setVideoSrc(newSrc);
      setFile(droppedFile);
      setMessage('');
      setUploadedFilename('');
      setGifUrl('');
      setTrim({ start: 0, end: null });
      setScenePoints([]);
      const video = document.createElement('video');
      video.src = newSrc;
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
        setTrim({ start: 0, end: video.duration });
      };
    } else {
      setFile(null);
      setVideoSrc(null);
      setMessage('Please drop a valid MP4, AVI, or MOV file.');
    }
  };

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

      setMessage('Analyzing video...');
      const analyzeResponse = await axios.post(`${process.env.REACT_APP_API_URL}/analyze`, {
        filename: uploadResponse.data.filename,
      });
      setScenePoints(analyzeResponse.data.scenes);
      setMessage(`Success: Uploaded and analyzed ${uploadResponse.data.filename}`);

      setFile(null);
      fileInputRef.current.value = '';
    } catch (error) {
      setMessage(`Upload/Analysis failed: ${error.response?.data?.message || 'Server error'}`);
    }
  };

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
        end: trim.end,
        text: textOverlay,
        font_size: fontSize,
        text_position: textPosition,
        text_style: textStyle
      });
      setMessage(`Success: Converted to ${response.data.filename}`);
      setGifUrl(response.data.url);
    } catch (error) {
      setMessage(`Conversion failed: ${error.response?.data?.message || 'Server error'}`);
    }
  };

  const handleTrimChange = ({ start, end }) => {
    setTrim({ start, end });
  };

  const textStyleOptions = [
    { value: 'default', label: 'White on Black', color: 'white', bg_color: 'black' },
    { value: 'yellow', label: 'Yellow on Blue', color: 'yellow', bg_color: 'blue' },
    { value: 'red', label: 'Red on Gray', color: 'red', bg_color: 'gray' },
  ];

  const textPositionOptions = ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

  return (
    <Box bg="white" borderRadius="xl" boxShadow="lg" p={{ base: 6, md: 8 }}>
      <Heading as="h2" size="lg" color="gray.800" mb={6}>
        Create Your GIF
      </Heading>

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
          name="fileInput"
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

      {(file || uploadedFilename) && videoSrc && (
        <VideoPlayer src={videoSrc} />
      )}

      {uploadedFilename && videoDuration > 0 && (
        <Box mt={8}>
          <Heading as="h3" size="md" color="gray.800" mb={4}>
            GIF Settings
          </Heading>
          <TrimSlider duration={videoDuration} scenes={scenePoints} onTrimChange={handleTrimChange} />
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mt={4}>
            <FormControl id="fpsControl">
              <FormLabel htmlFor="fpsInput" fontSize="sm" color="gray.600">
                Frames Per Second
              </FormLabel>
              <Input
                id="fpsInput"
                name="fps"
                type="number"
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                min="1"
                max="30"
                focusBorderColor="blue.500"
              />
            </FormControl>
            <FormControl id="widthControl">
              <FormLabel htmlFor="widthInput" fontSize="sm" color="gray.600">
                Width (px)
              </FormLabel>
              <Input
                id="widthInput"
                name="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min="100"
                max="1280"
                focusBorderColor="blue.500"
              />
            </FormControl>
          </SimpleGrid>
          <FormControl id="textOverlayControl" mt={4}>
            <FormLabel htmlFor="textOverlayInput" fontSize="sm" color="gray.600">
              Text Overlay
            </FormLabel>
            <Input
              id="textOverlayInput"
              name="textOverlay"
              value={textOverlay}
              onChange={(e) => setTextOverlay(e.target.value)}
              placeholder="Enter text"
              focusBorderColor="blue.500"
            />
          </FormControl>
          <FormControl id="textStyleControl" mt={4}>
            <FormLabel fontSize="sm" color="gray.600">
              Text Style
            </FormLabel>
            <RadioGroup value={textStyle} onChange={setTextStyle}>
              <Stack direction="column">
                {textStyleOptions.map((style) => (
                  <Radio key={style.value} value={style.value} id={`style-${style.value}`} name="textStyle">
                    {style.label}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
          </FormControl>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mt={4}>
            <FormControl id="fontSizeControl">
              <FormLabel htmlFor="fontSizeInput" fontSize="sm" color="gray.600">
                Font Size
              </FormLabel>
              <Input
                id="fontSizeInput"
                name="fontSize"
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                min="10"
                max="50"
                focusBorderColor="blue.500"
              />
            </FormControl>
            <FormControl id="textPositionControl">
              <FormLabel htmlFor="textPositionSelect" fontSize="sm" color="gray.600">
                Text Position
              </FormLabel>
              <Select
                id="textPositionSelect"
                name="textPosition"
                value={textPosition}
                onChange={(e) => setTextPosition(e.target.value)}
                focusBorderColor="blue.500"
              >
                {textPositionOptions.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </Select>
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