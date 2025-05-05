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
  // const [textStyle, setTextStyle] = useState('default'); // Removed, using separate color/font
  const [fuzz, setFuzz] = useState(5);
    const [textColor, setTextColor] = useState('white'); // Added textColor state
    const [textBgColor, setTextBgColor] = useState(''); // Added textBgColor state, '' means None
    const [fontStyle, setFontStyle] = useState('Arial'); // Added fontStyle state
    const fileInputRef = useRef(null); // <<< Add this line back

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
          // Use the color and font style from the radio buttons
          text_color: textColor, // Use state variable
          text_bg_color: textBgColor || null, // Send null if '' (None) is selected
          font_style: fontStyle,
        // fuzz, // Fuzz parameter removed from backend
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

  const textColorOptions = [
      "white", "black", "red", "blue", "green", "yellow", "orange", "purple"
  ];

  // Font names must be available on the backend server
  const fontStyleOptions = [
      "Arial", "Times New Roman", "Courier New", "Verdana"
  ];

  // Options for Background Color, including None
  const bgColorOptions = [
      { value: '', label: 'None (Transparent)' }, // Empty string represents None
      { value: 'black', label: 'Black' },
      { value: 'gray', label: 'Gray' },
      { value: 'white', label: 'White' },
      { value: '#80808080', label: 'Gray (Semi-Transparent)' } // Example with alpha
  ];

  // Changed 'e' to 'value' as RadioGroup onChange provides the value directly
  /* // Removed textStyle RadioGroup handler
  const handleTextStyleChange = (value) => {
      const selectedStyle = textStyleOptions.find(style => style.value === value);
      if (selectedStyle) { // Check if style was found
        setTextColor(selectedStyle.color);
        setFontStyle(selectedStyle.font);
        setTextStyle(value); // Update the textStyle state as well
      }
  };
  */

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
          {/* Removed Text Style Radio Group */}
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mt={4}>
            {/* Added Text Color Dropdown */}
            <FormControl id="textColorControl">
              <FormLabel htmlFor="textColorSelect" fontSize="sm" color="gray.600">
                Text Color
              </FormLabel>
              <Select
                id="textColorSelect"
                name="textColor"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                focusBorderColor="blue.500"
              >
                {textColorOptions.map((color) => (
                  <option key={color} value={color} style={{ textTransform: 'capitalize' }}>
                    {color}
                  </option>
                ))}
              </Select>
            </FormControl>
            {/* Added Font Style Dropdown */}
            <FormControl id="fontStyleControl">
              <FormLabel htmlFor="fontStyleSelect" fontSize="sm" color="gray.600">
                Font Style
              </FormLabel>
              <Select
                id="fontStyleSelect"
                name="fontStyle"
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value)}
                focusBorderColor="blue.500"
              >
                {fontStyleOptions.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </Select>
            </FormControl>
            {/* Added Text Background Color Dropdown */}
            <FormControl id="textBgColorControl">
              <FormLabel htmlFor="textBgColorSelect" fontSize="sm" color="gray.600">
                Text Background Color
              </FormLabel>
              <Select
                id="textBgColorSelect"
                name="textBgColor"
                value={textBgColor}
                onChange={(e) => setTextBgColor(e.target.value)}
                focusBorderColor="blue.500"
              >
                {bgColorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>
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
            {/* <FormControl id="fuzzControl">
              <FormLabel htmlFor="fuzzInput" fontSize="sm" color="gray.600">
                Compression Level (Fuzz)
              </FormLabel>
              <Input
                id="fuzzInput"
                name="fuzz"
                type="number"
                value={fuzz}
                onChange={(e) => setFuzz(Number(e.target.value))}
                min="0"
                max="100"
                focusBorderColor="blue.500"
              />
            </FormControl> */}
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