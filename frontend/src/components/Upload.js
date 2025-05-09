import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer'; // Assuming you have this component
import TrimSlider from './TrimSlider';   // Assuming you have this component
import {
  Box, Heading, Text, Button, Input, FormControl, FormLabel, Checkbox,
  SimpleGrid, Center, Image, Link, useColorModeValue, Select, VStack,
  Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Spinner
} from '@chakra-ui/react';

function Upload() {
  // File and URL states
  const [file, setFile] = useState(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [uploadedFilename, setUploadedFilename] = useState(''); // Filename on S3 after upload/URL processing
  const [videoSrc, setVideoSrc] = useState(null); // For local file preview

  // UI states
  const [message, setMessage] = useState({ text: '', type: 'info' }); // type: 'info', 'success', 'error'
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For general loading states

  // GIF Conversion settings states
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(320);
  const [trim, setTrim] = useState({ start: 0, end: null });
  const [videoDuration, setVideoDuration] = useState(0);
  const [scenePoints, setScenePoints] = useState([]);
  const [textOverlay, setTextOverlay] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [textPosition, setTextPosition] = useState('center');
  const [textColor, setTextColor] = useState('white');
  const [textBgColor, setTextBgColor] = useState(''); // Empty string for 'None'
  const [fontStyle, setFontStyle] = useState('Arial');
  const [speedFactor, setSpeedFactor] = useState(1.0);
  const [reverse, setReverse] = useState(false);
  const [includeAudio, setIncludeAudio] = useState(false); // New state for audio inclusion
  const [gifUrl, setGifUrl] = useState(''); // URL of the converted GIF

  const fileInputRef = useRef(null);

  // Chakra UI color mode values
  const borderColor = useColorModeValue('gray.300', 'gray.600'); // For dropzone border
  const dragActiveBg = useColorModeValue('blue.50', 'blue.900'); // For dropzone when dragging
  const dropZoneHoverBorder = useColorModeValue('blue.400', 'blue.500'); // For dropzone border on hover
  const mainBg = useColorModeValue('white', 'gray.800'); // Main component background
  const mainText = useColorModeValue('gray.800', 'whiteAlpha.900'); // Main component text
  const labelColor = useColorModeValue('gray.600', 'gray.400'); // For FormLabel
  const dropZoneInitialBg = useColorModeValue('gray.50', 'gray.700'); // Initial bg for dropzone
  const selectedFileNameColor = useColorModeValue('blue.600', 'blue.300'); // Color for selected file name
  const gifResultBoxBg = useColorModeValue('gray.50', 'gray.700'); // BG for the GIF result box
  // Cleanup for local video preview URL
  // This useEffect is responsible for revoking blob URLs when they are no longer needed.
  useEffect(() => {
    const srcToManage = videoSrc; // Capture the src for this specific effect run.

    return () => {
      // Only revoke if srcToManage was a blob URL.
      if (srcToManage && srcToManage.startsWith('blob:')) {
        URL.revokeObjectURL(srcToManage);
      }
    };
  }, [videoSrc]); // Re-run this effect if videoSrc changes.

  const resetConversionStates = () => {
    setGifUrl('');
    setTrim({ start: 0, end: null });
    setScenePoints([]);
    setVideoDuration(0);
    // Optionally reset other GIF settings here if desired
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && ['video/mp4', 'video/avi', 'video/quicktime', 'video/webm', 'video/x-matroska'].includes(selectedFile.type)) {
      const newSrc = URL.createObjectURL(selectedFile);
      setVideoSrc(newSrc);
      setFile(selectedFile);
      setMessage({ text: '', type: 'info' });
      setUploadedFilename('');
      resetConversionStates();
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = newSrc;
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
        setTrim({ start: 0, end: video.duration });
      };
      setVideoUrlInput(''); // Clear URL input
    } else {
      setFile(null);
      setVideoSrc(null);
      setMessage({ text: 'Please select a valid video file (MP4, AVI, MOV, WEBM, MKV).', type: 'error' });
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
    if (droppedFile && ['video/mp4', 'video/avi', 'video/quicktime', 'video/webm', 'video/x-matroska'].includes(droppedFile.type)) {
      const newSrc = URL.createObjectURL(droppedFile);
      setVideoSrc(newSrc);
      setFile(droppedFile);
      setMessage({ text: '', type: 'info' });
      setUploadedFilename('');
      resetConversionStates();
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = newSrc;
      video.onloadedmetadata = () => {
        setVideoDuration(video.duration);
        setTrim({ start: 0, end: video.duration });
      };
      setVideoUrlInput(''); // Clear URL input
    } else {
      setFile(null);
      setVideoSrc(null);
      setMessage({ text: 'Please drop a valid video file (MP4, AVI, MOV, WEBM, MKV).', type: 'error' });
    }
  };

  const handleProcessVideo = async () => {
    if (!file && !videoUrlInput) {
      setMessage({ text: 'Please select a file or enter a video URL.', type: 'error' });
      return;
    }
    setIsLoading(true);
    setMessage({ text: 'Processing video...', type: 'info' });
    setUploadedFilename(''); // Reset before new processing
    resetConversionStates();

    let filenameToProcess;

    if (file) {
      const formData = new FormData();
      formData.append('video', file);
      try {
        const uploadResponse = await axios.post(`${process.env.REACT_APP_API_URL}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        filenameToProcess = uploadResponse.data.filename;
        setUploadedFilename(filenameToProcess); // Set for analyze step
        setMessage({ text: `File uploaded: ${filenameToProcess}`, type: 'success' });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        // videoSrc is kept for preview until analysis is done
      } catch (error) {
        setMessage({ text: `File Upload failed: ${error.response?.data?.message || 'Server error'}`, type: 'error' });
        setIsLoading(false);
        return;
      }
    } else if (videoUrlInput) {
      try {
        const processUrlResponse = await axios.post(`${process.env.REACT_APP_API_URL}/process-url`, {
          url: videoUrlInput,
        });
        filenameToProcess = processUrlResponse.data.filename;
        setUploadedFilename(filenameToProcess); // Set for analyze step
        setMessage({ text: `Video from URL processed: ${filenameToProcess}`, type: 'success' });
        setVideoUrlInput('');
        setVideoSrc(null); // No local preview for URL-based videos
      } catch (error) {
        setMessage({ text: `URL Processing failed: ${error.response?.data?.message || 'Server error'}`, type: 'error' });
        setIsLoading(false);
        return;
      }
    }

    if (filenameToProcess) {
      try {
        setMessage({ text: 'Analyzing video...', type: 'info' });
        // Capture videoSrc before analysis, in case it's a local blob URL we want to preserve
        const videoSrcPriorToAnalysis = videoSrc;

        const analyzeResponse = await axios.post(`${process.env.REACT_APP_API_URL}/analyze`, {
          filename: filenameToProcess,
        });

        const backendPreviewUrl = analyzeResponse.data.preview_url;
        // Always update duration, scenes, and trim from analysis data
        setScenePoints(analyzeResponse.data.scenes);
        setVideoDuration(analyzeResponse.data.duration);
        setTrim({ start: 0, end: analyzeResponse.data.duration });

        if (backendPreviewUrl) {
          // If the backend provides a new preview URL, use it.
          setVideoSrc(backendPreviewUrl);
        } else if (videoSrcPriorToAnalysis && videoSrcPriorToAnalysis.startsWith('blob:')) {
          // If backend didn't provide a preview URL, but we had a local blob preview captured
          // before the /analyze call, ensure videoSrc is set to this captured blob URL.
          // This handles cases where videoSrc might have been inadvertently changed during awaits.
          setVideoSrc(videoSrcPriorToAnalysis);
        } else {
          // If backend didn't provide a preview URL AND there was no prior blob preview (e.g. from URL input path)
          setVideoSrc(null); // Or setVideoSrc(backendPreviewUrl) which would be falsy
        }
        setMessage({ text: `Video analyzed successfully. Ready to convert.`, type: 'success' });
      } catch (error) {
        setMessage({ text: `Analysis failed: ${error.response?.data?.message || 'Server error'}`, type: 'error' });
        setUploadedFilename(''); // Clear if analysis fails
      }
    }
    setIsLoading(false);
  };

  const handleConvert = async () => {
    if (!uploadedFilename) {
      setMessage({ text: 'Please upload or process a video first.', type: 'error' });
      return;
    }
    setIsLoading(true);
    setMessage({ text: 'Converting to GIF...', type: 'info' });
    setGifUrl(''); // Clear previous GIF

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/convert`, {
        filename: uploadedFilename,
        fps,
        width,
        start: trim.start,
        end: trim.end,
        text: textOverlay || null, // Send null if empty
        font_size: fontSize,
        text_position: textPosition,
        text_color: textColor,
        text_bg_color: textBgColor || null, // Send null if empty string (None)
        font_style: fontStyle,
        speed_factor: speedFactor,
        reverse: reverse,
        include_audio: includeAudio, // Send audio preference to backend
      });
      setMessage({ text: `Success: Converted to ${response.data.filename}`, type: 'success' });
      setGifUrl(response.data.url);
    } catch (error) {
      setMessage({ text: `Conversion failed: ${error.response?.data?.message || 'Server error'}`, type: 'error' });
    }
    setIsLoading(false);
  };

  const handleTrimChange = ({ start, end }) => {
    setTrim({ start, end });
  };

  const textColorOptions = ["white", "black", "red", "blue", "green", "yellow", "orange", "purple", "pink", "cyan"];
  const fontStyleOptions = ["Arial", "Times New Roman", "Courier New", "Verdana", "Georgia", "Comic Sans MS"];
  const bgColorOptions = [
    { value: '', label: 'None (Transparent)' },
    { value: 'black', label: 'Black' },
    { value: 'white', label: 'White' },
    { value: 'gray', label: 'Gray' },
    { value: 'red', label: 'Red' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: '#80808080', label: 'Gray (Semi-Transparent)' }
  ];
  const textPositionOptions = ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

  return (
    <Box bg={mainBg} borderRadius="xl" boxShadow="lg" p={{ base: 4, md: 8 }} color={mainText}>
      <Heading as="h2" size="lg" mb={6} textAlign="center">
        MP4 to GIF Converter
      </Heading>

      {message.text && (
        <Alert status={message.type} borderRadius="md" mb={4}>
          <AlertIcon />
          <Box flex="1">
            <AlertTitle mr={2}>
              {message.type === 'success' ? 'Success!' : message.type === 'error' ? 'Error!' : 'Info'}
            </AlertTitle>
            <AlertDescription display="block">{message.text}</AlertDescription>
          </Box>
          <CloseButton onClick={() => setMessage({ text: '', type: 'info' })} position="absolute" right="8px" top="8px" />
        </Alert>
      )}

      <VStack spacing={6} align="stretch">
        <Box
          borderWidth={2}
          borderStyle="dashed"
          borderColor={isDragging ? dropZoneHoverBorder : borderColor}
          bg={isDragging ? dragActiveBg : dropZoneInitialBg}
          borderRadius="lg"
          p={8}
          textAlign="center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          _hover={{ borderColor: dropZoneHoverBorder }}
          transition="all 0.3s"
        >
          <Text color={labelColor} mb={4}>
            {file ? (
              <Text as="span" fontWeight="medium" color={selectedFileNameColor}>
                {file.name}
              </Text>
            ) : (
              'Drag & drop your video here or click to select'
            )}
          </Text>
          <Input
            type="file"
            accept=".mp4,.avi,.mov,.webm,.mkv"
            onChange={handleFileChange}
            ref={fileInputRef}
            display="none"
            id="fileInput"
          />
          <Button as="label" htmlFor="fileInput" colorScheme="blue" size="md" cursor="pointer">
            Select Video File
          </Button>
        </Box>

        <Text textAlign="center" my={2} color={labelColor} fontWeight="medium">OR</Text>

        <FormControl id="videoUrlControl">
          <FormLabel htmlFor="videoUrlInput" fontSize="sm" color={labelColor}>
            Enter Video URL
          </FormLabel>
          <Input
            id="videoUrlInput"
            type="url"
            placeholder="e.g., https://example.com/video.mp4"
            value={videoUrlInput}
            onChange={(e) => {
              setVideoUrlInput(e.target.value);
              if (e.target.value) {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                resetConversionStates();
                // videoSrc is intentionally not cleared here to keep local preview if user is just typing in URL field
                setUploadedFilename('');
              }
            }}
            focusBorderColor="blue.500"
          />
        </FormControl>

        <Button
          onClick={handleProcessVideo}
          isDisabled={(!file && !videoUrlInput) || isLoading}
          colorScheme="green"
          size="lg"
          w="full"
          isLoading={isLoading && !gifUrl} // Show spinner only during initial processing
          spinner={<Spinner size="sm" />}
        >
          {isLoading && !gifUrl ? 'Processing...' : 'Process Video'}
        </Button>
      </VStack>

      {videoSrc && !gifUrl && <VideoPlayer src={videoSrc} />}

      {uploadedFilename && videoDuration > 0 && (
        <Box mt={8}>
          <Heading as="h3" size="md" mb={4}>
            GIF Settings
          </Heading>
          <TrimSlider duration={videoDuration} scenes={scenePoints} onTrimChange={handleTrimChange} />
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={6}>
            <FormControl>
              <FormLabel htmlFor="fpsInput" fontSize="sm" color={labelColor}>Frames Per Second</FormLabel>
              <Input id="fpsInput" type="number" value={fps} onChange={(e) => setFps(Number(e.target.value))} min="1" max="60" focusBorderColor="blue.500" />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="widthInput" fontSize="sm" color={labelColor}>Width (px)</FormLabel>
              <Input id="widthInput" type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} min="100" max="1280" focusBorderColor="blue.500" />
            </FormControl>
          </SimpleGrid>

          <FormControl mt={4}>
            <FormLabel htmlFor="textOverlayInput" fontSize="sm" color={labelColor}>Text Overlay</FormLabel>
            <Input id="textOverlayInput" value={textOverlay} onChange={(e) => setTextOverlay(e.target.value)} placeholder="Enter text" focusBorderColor="blue.500" />
          </FormControl>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={4}>
            <FormControl>
              <FormLabel htmlFor="textColorSelect" fontSize="sm" color={labelColor}>Text Color</FormLabel>
              <Select id="textColorSelect" value={textColor} onChange={(e) => setTextColor(e.target.value)} focusBorderColor="blue.500">
                {textColorOptions.map((color) => (
                  <option key={color} value={color} style={{ textTransform: 'capitalize' }}>{color}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="fontStyleSelect" fontSize="sm" color={labelColor}>Font Style</FormLabel>
              <Select id="fontStyleSelect" value={fontStyle} onChange={(e) => setFontStyle(e.target.value)} focusBorderColor="blue.500">
                {fontStyleOptions.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="textBgColorSelect" fontSize="sm" color={labelColor}>Text Background Color</FormLabel>
              <Select id="textBgColorSelect" value={textBgColor} onChange={(e) => setTextBgColor(e.target.value)} focusBorderColor="blue.500">
                {bgColorOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
            <FormControl>
              <FormLabel htmlFor="fontSizeInput" fontSize="sm" color={labelColor}>Font Size</FormLabel>
              <Input id="fontSizeInput" type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} min="8" max="72" focusBorderColor="blue.500" />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="textPositionSelect" fontSize="sm" color={labelColor}>Text Position</FormLabel>
              <Select id="textPositionSelect" value={textPosition} onChange={(e) => setTextPosition(e.target.value)} focusBorderColor="blue.500">
                {textPositionOptions.map((pos) => (
                  <option key={pos} value={pos} style={{ textTransform: 'capitalize' }}>{pos.replace('-', ' ')}</option>
                ))}
              </Select>
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
            <FormControl>
              <FormLabel htmlFor="speedFactorInput" fontSize="sm" color={labelColor}>Playback Speed</FormLabel>
              <Input id="speedFactorInput" type="number" step="0.1" min="0.1" max="5.0" value={speedFactor} onChange={(e) => setSpeedFactor(parseFloat(e.target.value) || 1.0)} focusBorderColor="blue.500" />
            </FormControl>
            <FormControl display="flex" alignItems="center" justifyContent={{ base: 'flex-start', md: 'center' }} pt={{ base: 2, md: 8 }}>
              <Checkbox id="reverseCheckbox" isChecked={reverse} onChange={(e) => setReverse(e.target.checked)}>
                Reverse Playback
              </Checkbox>
            </FormControl>
          </SimpleGrid>

          <FormControl display="flex" alignItems="center" mt={4}>
            <Checkbox id="includeAudioCheckbox" isChecked={includeAudio} onChange={(e) => setIncludeAudio(e.target.checked)}>
              Include Audio (outputs as short video e.g., MP4)
            </Checkbox>
          </FormControl>
          <Button
            onClick={handleConvert}
            colorScheme="purple"
            size="lg"
            w="full"
            mt={8}
            isLoading={isLoading && !!uploadedFilename && !gifUrl} // Show spinner only during conversion
            spinner={<Spinner size="sm" />}
          >
            {isLoading && !!uploadedFilename && !gifUrl ? 'Converting...' : 'Convert to GIF'}
          </Button>
        </Box>
      )}

      {gifUrl && (
        <Box mt={8}>
          <Heading as="h3" size="md" mb={4}>
            Your {includeAudio ? 'Video' : 'GIF'} is Ready!
          </Heading>
          <Box bg={gifResultBoxBg} borderRadius="lg" p={4}>
            <Center>
              {includeAudio ? (
                // If audio is included, use VideoPlayer for the output (likely MP4)
                // The 'gifUrl' state would now hold the URL to the video file
                <VideoPlayer src={gifUrl} />
              ) : (
                // Otherwise, display as an image (standard GIF)
                <Image src={gifUrl} alt="Converted GIF" maxW="full" borderRadius="md" />
              )}
            </Center>
            <Link href={gifUrl} download isExternal _hover={{textDecoration: 'none'}}>
              <Button colorScheme="teal" size="lg" w="full" mt={4}>
                Download {includeAudio ? 'Video' : 'GIF'}
              </Button>
            </Link>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Upload;
