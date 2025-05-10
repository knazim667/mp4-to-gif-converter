import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer'; // Assuming you have this component
import TrimSlider from './TrimSlider';   // Assuming you have this component
import {
  Box, Heading, Text, Button, Input, FormControl, FormLabel, Checkbox, HStack,
  SimpleGrid, Center, Image, Link, useColorModeValue, Select, VStack,
  Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Spinner,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Divider, Icon
} from '@chakra-ui/react';
import { FiUploadCloud } from 'react-icons/fi'; // Example icon

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
  // Crop states (x, y, width, height) - null means not set/no crop
  const [cropX, setCropX] = useState(null);
  const [cropY, setCropY] = useState(null);
  const [cropW, setCropW] = useState(null);
  const [cropH, setCropH] = useState(null);
  // State for visual cropper
  const [showVisualCropper, setShowVisualCropper] = useState(false);
  const [videoPreviewDimensions, setVideoPreviewDimensions] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const [selectionRect, setSelectionRect] = useState({ x: 0, y: 0, width: 100, height: 100 }); // Initial/default selection for visual cropper


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

  // Hoisted color mode values previously used directly in JSX
  const settingsBoxBg = useColorModeValue('white', 'gray.750');
  const settingsHeadingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const resultHeadingColor = useColorModeValue('purple.600', 'purple.300');
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
    setCropX(null);
    setCropY(null);
    setCropW(null);
    setCropH(null);
    setShowVisualCropper(false); // Reset visual cropper state
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
        // Call handleVideoMetadata here as well for local files
        handleVideoMetadata({
            width: video.videoWidth,
            height: video.videoHeight,
            naturalWidth: video.videoWidth,
            naturalHeight: video.videoHeight
        });
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
         // Call handleVideoMetadata here as well for local files
        handleVideoMetadata({
            width: video.videoWidth,
            height: video.videoHeight,
            naturalWidth: video.videoWidth,
            naturalHeight: video.videoHeight
        });
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
          // For URL-based videos, metadata will be fetched by VideoPlayer's onMetadataLoaded
        } else if (videoSrcPriorToAnalysis && videoSrcPriorToAnalysis.startsWith('blob:')) {
          // If backend didn't provide a preview URL, but we had a local blob preview captured
          // before the /analyze call, ensure videoSrc is set to this captured blob URL.
          // Metadata for local files is already handled in handleFileChange/handleDrop
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
    setMessage({ text: 'Converting...', type: 'info' }); // Generic "Converting..."
    setGifUrl(''); // Clear previous GIF/video

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
        crop_x: cropX,
        crop_y: cropY,
        crop_w: cropW,
        crop_h: cropH,
      });
      const outputType = includeAudio ? 'Video' : 'GIF';
      setMessage({ text: `Success: Converted to ${outputType}. File: ${response.data.filename}`, type: 'success' });
      setGifUrl(response.data.url);
    } catch (error) {
      setMessage({ text: `Conversion failed: ${error.response?.data?.message || 'Server error'}`, type: 'error' });
    }
    setIsLoading(false);
  };

  const handleTrimChange = ({ start, end }) => {
    setTrim({ start, end });
  };

  // Callback for VideoPlayer to report its dimensions
  const handleVideoMetadata = useCallback(({ width, height, naturalWidth, naturalHeight }) => {
    setVideoPreviewDimensions({ width, height, naturalWidth, naturalHeight });
    // Initialize or adjust selectionRect based on new video dimensions if needed
    // For example, set a default crop or ensure existing crop is valid
    const initialSelectionWidth = naturalWidth / 4;
    const initialSelectionHeight = naturalHeight / 4;
    const initialX = (naturalWidth - initialSelectionWidth) / 2;
    const initialY = (naturalHeight - initialSelectionHeight) / 2;
    
    // Update selectionRect, potentially preserving parts of old selection if dimensions match
    // This part might need more sophisticated logic based on desired UX when video changes
    setSelectionRect(currentSelection => ({
        x: initialX,
        y: initialY,
        width: initialSelectionWidth,
        height: initialSelectionHeight,
        // Store natural dimensions with selection for context, useful for scaling
        selectionNaturalWidth: naturalWidth, 
        selectionNaturalHeight: naturalHeight 
    }));

    // Update numerical inputs as well, only if they haven't been manually set or if visual cropper is active
    if (cropX === null || showVisualCropper) {
        setCropX(Math.round(initialX));
    }
    if (cropY === null || showVisualCropper) {
        setCropY(Math.round(initialY));
    }
    if (cropW === null || showVisualCropper) {
        setCropW(Math.round(initialSelectionWidth));
    }
    if (cropH === null || showVisualCropper) {
        setCropH(Math.round(initialSelectionHeight));
    }
  }, [cropX, cropY, cropW, cropH, showVisualCropper]); // Dependencies for useCallback

  // This function would be called by the visual cropper component when the selection changes
  const handleVisualCropChange = (newRect) => {
    // newRect should contain x, y, width, height in pixels relative to the original video dimensions
    setCropX(Math.round(newRect.x));
    setCropY(Math.round(newRect.y));
    setCropW(Math.round(newRect.width));
    setCropH(Math.round(newRect.height));
    setSelectionRect(newRect); // Keep visual selection in sync if it's different from original scale
  };

  const fontStyleOptions = ["Arial", "Times New Roman", "Courier New", "Verdana", "Georgia", "Comic Sans MS"];

  return (
    <Box bg={mainBg} borderRadius="xl" boxShadow="lg" p={{ base: 4, md: 8 }} color={mainText}>
      <Heading as="h2" size="xl" mb={8} textAlign="center" fontWeight="bold">
        Video to GIF & MP4 Converter
      </Heading>

      {message.text && (
        <Alert status={message.type} borderRadius="md" mb={6} variant="subtle">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle mr={2} fontWeight="semibold">
              {message.type === 'success' ? 'Success!' : message.type === 'error' ? 'Error!' : 'Info'}
            </AlertTitle>
            <AlertDescription display="block">{message.text}</AlertDescription>
          </Box>
          <CloseButton onClick={() => setMessage({ text: '', type: 'info' })} position="absolute" right="8px" top="8px" />
        </Alert>
      )}

      <VStack spacing={6} align="stretch" mb={8}>
        <Box
          borderWidth={2}
          borderStyle="dashed"
          borderColor={isDragging ? dropZoneHoverBorder : borderColor}
          bg={isDragging ? dragActiveBg : dropZoneInitialBg}
          borderRadius="lg"
          p={{ base: 6, md: 10 }}
          textAlign="center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          _hover={{ borderColor: dropZoneHoverBorder, cursor: 'pointer' }}
          transition="all 0.3s ease-in-out"
          onClick={() => fileInputRef.current && fileInputRef.current.click()} // Make entire box clickable
        >
          <Icon as={FiUploadCloud} w={12} h={12} color={labelColor} mb={3} />
          <Text color={labelColor} mb={4} fontSize="lg">
            {file ? (
              <Text as="span" fontWeight="medium" color={selectedFileNameColor}>
                Selected: {file.name}
              </Text>
            ) : (
              'Drag & drop your video here, or click to select'
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
          <Button variant="outline" colorScheme="blue" size="md" onClick={(e) => { e.stopPropagation(); fileInputRef.current && fileInputRef.current.click(); }}>
            {file ? 'Change Video' : 'Select Video File'}
          </Button>
        </Box>

        <HStack align="center" spacing={4}>
            <Divider borderColor={borderColor} />
            <Text textAlign="center" color={labelColor} fontWeight="medium" whiteSpace="nowrap">
                OR
            </Text>
            <Divider borderColor={borderColor} />
        </HStack>

        <FormControl id="videoUrlControl">
          <FormLabel htmlFor="videoUrlInput" fontSize="sm" color={labelColor} fontWeight="medium">
            Enter Video URL
          </FormLabel>
          <Input
            id="videoUrlInput"
            type="url"
            placeholder="e.g., https://example.com/video.mp4 or YouTube link"
            value={videoUrlInput}
            onChange={(e) => {
              setVideoUrlInput(e.target.value);
              if (e.target.value) {
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                resetConversionStates();
                setUploadedFilename('');
              }
            }}
            focusBorderColor="blue.500"
            size="lg"
          />
        </FormControl>

        <Button
          onClick={handleProcessVideo}
          isDisabled={(!file && !videoUrlInput) || isLoading}
          colorScheme="green"
          size="lg"
          w="full"
          isLoading={isLoading && !gifUrl && !uploadedFilename} // Show spinner only during initial processing
          spinner={<Spinner size="md" />}
          leftIcon={isLoading && !gifUrl && !uploadedFilename ? undefined : <Icon as={FiUploadCloud} />}
        >
          {isLoading && !gifUrl && !uploadedFilename ? 'Processing...' : 'Process Video'}
        </Button>
      </VStack>

      {/* Video Preview Area - show if videoSrc is available and no GIF is generated, OR if visual cropper is active */}
      {(videoSrc && !gifUrl && !showVisualCropper) && <VideoPlayer src={videoSrc} onMetadataLoaded={handleVideoMetadata} />}

      {showVisualCropper && videoSrc && videoPreviewDimensions.naturalWidth > 0 && (
        <Box my={4} p={4} borderWidth="1px" borderRadius="lg" borderColor="blue.500">
            <Heading size="md" mb={2}>Visual Crop</Heading>
            <Text mb={2}>Video Dimensions: {videoPreviewDimensions.naturalWidth}x{videoPreviewDimensions.naturalHeight} (Original)</Text>
            <Text mb={4}>Displayed Preview Dimensions: {videoPreviewDimensions.width}x{videoPreviewDimensions.height}</Text>
            {/* 
              This is where you would integrate a visual cropping component.
              It would receive `videoSrc`, `videoPreviewDimensions`, `selectionRect`, 
              and call `handleVisualCropChange` on interaction.
              Example: <VisualCropperComponent videoSrc={videoSrc} dimensions={videoPreviewDimensions} initialSelection={selectionRect} onSelectionChange={handleVisualCropChange} />
            */}
            <Box
                position="relative"
                width={`${videoPreviewDimensions.width}px`} // Match displayed video width
                height={`${videoPreviewDimensions.height}px`} // Match displayed video height
                mx="auto" // Center it
                border="2px dashed gray"
                overflow="hidden" // Important if video itself is larger than this box
            >
                <video
                    src={videoSrc}
                    style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
                    controls={false} // No controls for the cropper background
                    autoPlay={false}
                    muted
                />
                {/* Placeholder for draggable selection box - to be replaced by a real component */}
                <Box
                    position="absolute"
                    border="2px solid blue"
                    bg="rgba(0,0,255,0.2)"
                    style={{
                        left: `${(selectionRect.x / videoPreviewDimensions.naturalWidth) * videoPreviewDimensions.width}px`,
                        top: `${(selectionRect.y / videoPreviewDimensions.naturalHeight) * videoPreviewDimensions.height}px`,
                        width: `${(selectionRect.width / videoPreviewDimensions.naturalWidth) * videoPreviewDimensions.width}px`,
                        height: `${(selectionRect.height / videoPreviewDimensions.naturalHeight) * videoPreviewDimensions.height}px`,
                        cursor: 'move', // Basic cursor
                    }}
                >
                    <Text color="white" p={1} bg="blue.500" fontSize="xs">Drag/Resize Me (Placeholder)</Text>
                </Box>
            </Box>
            <Text mt={2} fontSize="sm">Current Crop (Original Dims): X={cropX ?? 0}, Y={cropY ?? 0}, W={cropW ?? 0}, H={cropH ?? 0}</Text>
        </Box>
      )}

      {uploadedFilename && videoDuration > 0 && (
        <Box mt={10}>
          <Heading as="h3" size="lg" mb={6} textAlign="center" borderBottomWidth="2px" borderColor={borderColor} pb={3}>
            Conversion Settings
          </Heading>

          <Box p={{base: 4, md: 6}} borderWidth="1px" borderRadius="lg" shadow="md" mb={8} bg={settingsBoxBg} id="trim-section">
            <TrimSlider
              duration={videoDuration}
              value={trim} // Pass the trim state
              onTrimChange={handleTrimChange} // Use the updated handler
              scenes={scenePoints}
            />
          </Box>

          <VStack spacing={8} align="stretch">
            <Box p={{base: 4, md: 6}} borderWidth="1px" borderRadius="lg" shadow="md" bg={settingsBoxBg} id="output-options-section">
              <Heading as="h4" size="md" mb={5} color={settingsHeadingColor}>Output Options</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl>
                  <FormLabel htmlFor="fps" color={labelColor}>FPS (Frames Per Second)</FormLabel>
                  <NumberInput id="fps" value={fps} min={1} max={60} onChange={(valStr, valNum) => setFps(valNum)} focusBorderColor="blue.500">
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="width" color={labelColor}>Output Width (pixels)</FormLabel>
                  <NumberInput id="width" value={width} min={100} max={1920} step={10} onChange={(valStr, valNum) => setWidth(valNum)} focusBorderColor="blue.500">
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
              <FormControl display="flex" alignItems="center" mt={8}>
                <Checkbox id="includeAudioCheckbox" isChecked={includeAudio} onChange={(e) => setIncludeAudio(e.target.checked)} size="lg" colorScheme="green">
                  Include Audio (outputs as short video, e.g., MP4)
                </Checkbox>
              </FormControl>
            </Box>

            <Box p={{base: 4, md: 6}} borderWidth="1px" borderRadius="lg" shadow="md" bg={settingsBoxBg} id="crop-section">
              <Heading as="h4" size="md" mb={5} color={settingsHeadingColor}>Crop Video (Optional)</Heading>
              <Button
                onClick={() => setShowVisualCropper(!showVisualCropper)}
                colorScheme={showVisualCropper ? "orange" : "blue"}
                mb={4}
                isDisabled={!videoSrc || videoPreviewDimensions.naturalWidth === 0}
              >
                {showVisualCropper ? "Hide Visual Cropper & Use Numerical Inputs" : "Visually Select Crop Area"}
              </Button>
              {!showVisualCropper && (
                <Text fontSize="sm" color={labelColor} mb={4}>
                  Specify crop numerically, or use the visual tool above. Values are in pixels relative to original video.
                </Text>)}
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                <FormControl>
                  <FormLabel htmlFor="cropX" color={labelColor}>X</FormLabel>
                  <NumberInput id="cropX" value={cropX ?? ''} min={0} onChange={(valStr, valNum) => setCropX(valStr === '' ? null : parseInt(valNum, 10))} placeholder="e.g., 10" focusBorderColor="blue.500">
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="cropY" color={labelColor}>Y</FormLabel>
                  <NumberInput id="cropY" value={cropY ?? ''} min={0} onChange={(valStr, valNum) => setCropY(valStr === '' ? null : parseInt(valNum, 10))} placeholder="e.g., 10" focusBorderColor="blue.500">
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="cropW" color={labelColor}>Width</FormLabel>
                  <NumberInput id="cropW" value={cropW ?? ''} min={0} onChange={(valStr, valNum) => setCropW(valStr === '' ? null : parseInt(valNum, 10))} placeholder="e.g., 640" focusBorderColor="blue.500">
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor="cropH" color={labelColor}>Height</FormLabel>
                  <NumberInput id="cropH" value={cropH ?? ''} min={0} onChange={(valStr, valNum) => setCropH(valStr === '' ? null : parseInt(valNum, 10))} placeholder="e.g., 480" focusBorderColor="blue.500">
                    <NumberInputField />
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
            </Box>

            <Box p={{base: 4, md: 6}} borderWidth="1px" borderRadius="lg" shadow="md" bg={settingsBoxBg} id="text-overlay-section">
              <Heading as="h4" size="md" mb={5} color={settingsHeadingColor}>Text Overlay</Heading>
              <VStack spacing={5} align="stretch">
                <FormControl>
                  <FormLabel htmlFor="textOverlay" color={labelColor}>Text</FormLabel>
                  <Input id="textOverlay" placeholder="Enter text to overlay" value={textOverlay} onChange={(e) => setTextOverlay(e.target.value)} focusBorderColor="blue.500" />
                </FormControl>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel htmlFor="fontSize" color={labelColor}>Font Size</FormLabel>
                    <NumberInput id="fontSize" value={fontSize} min={8} max={100} onChange={(valStr, valNum) => setFontSize(valNum)} focusBorderColor="blue.500">
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="fontStyle" color={labelColor}>Font Style</FormLabel>
                    <Select id="fontStyle" value={fontStyle} onChange={(e) => setFontStyle(e.target.value)} focusBorderColor="blue.500">
                      {fontStyleOptions.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel htmlFor="textColor" color={labelColor}>Text Color</FormLabel>
                    <Input id="textColor" type="text" placeholder="e.g., white or #FFFFFF" value={textColor} onChange={(e) => setTextColor(e.target.value)} focusBorderColor="blue.500" />
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="textBgColor" color={labelColor}>Text Background Color (optional)</FormLabel>
                    <Input id="textBgColor" type="text" placeholder="e.g., black or #00000080" value={textBgColor} onChange={(e) => setTextBgColor(e.target.value)} focusBorderColor="blue.500" />
                  </FormControl>
                </SimpleGrid>
                <FormControl>
                  <FormLabel htmlFor="textPosition" color={labelColor}>Text Position</FormLabel>
                  <Select id="textPosition" value={textPosition} onChange={(e) => setTextPosition(e.target.value)} focusBorderColor="blue.500">
                    <option value="center">Center</option>
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                  </Select>
                </FormControl>
              </VStack>
            </Box>

            <Box p={{base: 4, md: 6}} borderWidth="1px" borderRadius="lg" shadow="md" bg={settingsBoxBg} id="effects-section">
              <Heading as="h4" size="md" mb={5} color={settingsHeadingColor}>Video Effects</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} alignItems="center">
                <FormControl>
                  <FormLabel htmlFor="speedFactor" color={labelColor}>Speed Factor</FormLabel>
                  <NumberInput id="speedFactor" value={speedFactor} min={0.1} max={5.0} step={0.1} precision={1} onChange={(valStr, valNum) => setSpeedFactor(parseFloat(valNum) || 1.0)} focusBorderColor="blue.500">
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl display="flex" alignItems="center" pt={{ md: "32px" }}> {/* Align checkbox with label better */}
                  <Checkbox id="reverseCheckbox" isChecked={reverse} onChange={(e) => setReverse(e.target.checked)} size="lg" colorScheme="orange">
                    Reverse Video
                  </Checkbox>
                </FormControl>
              </SimpleGrid>
            </Box>
          </VStack>

          <Divider my={10} />

          <Button
            onClick={handleConvert}
            colorScheme="purple"
            size="lg"
            w="full"
            isLoading={isLoading && !!uploadedFilename && !gifUrl} // Show spinner only during conversion
            spinner={<Spinner size="md" />}
            leftIcon={isLoading && !!uploadedFilename && !gifUrl ? undefined : <Icon as={FiUploadCloud} transform="rotate(90deg)" />} // Example icon
          >
            {isLoading && !!uploadedFilename && !gifUrl ? 'Converting...' : `Convert to ${includeAudio ? 'MP4' : 'GIF'}`}
          </Button>
        </Box>
      )}

      {gifUrl && (
        <Box mt={10} p={{base: 4, md: 6}} borderWidth="1px" borderRadius="lg" shadow="xl" bg={gifResultBoxBg}>
          <Heading as="h3" size="lg" mb={6} textAlign="center" color={resultHeadingColor}>
            Your {includeAudio ? 'Video' : 'GIF'} is Ready!
          </Heading>
          <Box borderRadius="md" overflow="hidden">
            <Center>
              {includeAudio ? (
                <VideoPlayer src={gifUrl} onMetadataLoaded={() => {}} /> // Pass dummy if not needed for result
              ) : (
                <Image src={gifUrl} alt={`Converted ${includeAudio ? 'Video' : 'GIF'}`} maxW="full" borderRadius="md" />
              )}
            </Center>
          </Box>
          <Link href={gifUrl} download isExternal _hover={{textDecoration: 'none'}}>
            <Button colorScheme="teal" size="lg" w="full" mt={6} leftIcon={<Icon as={FiUploadCloud} transform="rotate(180deg)" />}>
              Download {includeAudio ? 'Video' : 'GIF'}
            </Button>
          </Link>
        </Box>
      )}
    </Box>
  );
}

export default Upload;
