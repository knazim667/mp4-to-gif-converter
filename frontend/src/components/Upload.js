import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer'; // Assuming you have this component
import TrimSlider from './TrimSlider';   // Assuming you have this component
import {
  Box, Heading, Text, Button, Input, FormControl, FormLabel, Checkbox, HStack,
  SimpleGrid, Center, Image, Link, useColorModeValue, Select, VStack,
  Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Spinner, Progress,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Divider, Icon
} from '@chakra-ui/react';
import { FiUploadCloud } from 'react-icons/fi'; // Example icon

/*
Upcoming Features & Potential Enhancements:

*   Real-time Previews:
    *   Live preview for text overlay adjustments (font, size, color, position).
    *   Attempt real-time feedback for some simpler effects.
*   Granular Progress Indicators:
    *   Detailed progress bars for file uploads (percentage).
    *   Step-by-step progress updates during the conversion process (e.g., "Trimming...", "Applying effects...", "Encoding...").
*   Preset Options:
    *   Pre-defined configurations for common use cases (e.g., "High-Quality GIF," "Small Email GIF," "Social Media MP4").
*   Additional Video Effects/Filters:
    *   Brightness, contrast, saturation adjustments.
    *   Grayscale, Sepia filters.
*   Enhanced Visual Cropper:
    *   Aspect ratio locking for crop selection.
    *   Real-time display of numeric crop values (X, Y, W, H) during visual selection.
    *   Snapping options (to edges, center).
*   Componentization of Settings:
    *   Refactor large UI sections (e.g., Output Options, Crop, Text Overlay, Effects) into smaller, more manageable React components.
*   User Configurations/Templates:
    *   Allow users to save their current set of conversion settings as a template.
    *   Ability to load saved templates for frequent tasks.
*   Advanced GIF Options:
    *   Dithering options for better color quality in GIFs.
    *   Loop count control.
*/

function Upload() {

    // Define Preset Configurations
  const presets = [
    {
      name: "Default (Custom)",
      settings: { fps: 10, width: 320, includeAudio: false, speedFactor: 1.0, reverse: false, outputFormat: 'gif' } // Default matches initial states
    },
    {
      name: "High-Quality GIF",
      settings: { fps: 15, width: 480, includeAudio: false, speedFactor: 1.0, reverse: false, outputFormat: 'gif' }
    },
    {
      name: "Small Email GIF",
      settings: { fps: 8, width: 200, includeAudio: false, speedFactor: 1.0, reverse: false, outputFormat: 'gif' }
    },
    {
      name: "Social Media MP4 (Short Clip)",
      settings: { fps: 24, width: 720, includeAudio: true, speedFactor: 1.0, reverse: false, outputFormat: 'mp4' }
    },
    {
      name: "Animated Emoji (Tiny GIF)",
      settings: { fps: 10, width: 128, includeAudio: false, speedFactor: 1.0, reverse: false, outputFormat: 'gif' }
    }
  ];

  // File and URL states
  const [file, setFile] = useState(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [uploadedFilename, setUploadedFilename] = useState(''); // Filename on S3 after upload/URL processing
  const [videoPlayerKey, setVideoPlayerKey] = useState(Date.now()); // Key for VideoPlayer
  const [videoSrc, setVideoSrc] = useState(null); // For local file preview


  const [selectedPreset, setSelectedPreset] = useState(presets[0].name); // Default to the first preset

  // UI states
  const [message, setMessage] = useState({ text: '', type: 'info' }); // type: 'info', 'success', 'error'
  const [isDragging, setIsDragging] = useState(false);
  // const [isLoading, setIsLoading] = useState(false); // For general loading states - Replaced by specific loaders
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Specifically for the /analyze step
  const [isUploading, setIsUploading] = useState(false); // Specifically for file upload
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [outputUrl, setOutputUrl] = useState(null); // To display the generated GIF or MP4 (renamed from gifUrl)


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
  const [textBgColor, setTextBgColor] = useState('');
  const [fontStyle, setFontStyle] = useState('Arial');
  const [speedFactor, setSpeedFactor] = useState(presets[0].settings.speedFactor);
  const [reverse, setReverse] = useState(presets[0].settings.reverse);
  const [includeAudio, setIncludeAudio] = useState(presets[0].settings.includeAudio);
  const [outputFormat, setOutputFormat] = useState(presets[0].settings.outputFormat);

  // Crop states (x, y, width, height) - null means not set/no crop
  const [cropX, setCropX] = useState(null);
  const [cropY, setCropY] = useState(null);
  const [cropW, setCropW] = useState(null);
  const [cropH, setCropH] = useState(null);
  // State for visual cropper
  const [showVisualCropper, setShowVisualCropper] = useState(false);
  const [videoPreviewDimensions, setVideoPreviewDimensions] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const [selectionRect, setSelectionRect] = useState({ x: 0, y: 0, width: 100, height: 100 }); // Initial/default selection for visual cropper


  // State for visual cropper interaction
  const [interaction, setInteraction] = useState({
    type: null, // 'drag', 'resize'
    handle: null, // e.g., 'body', 'se' (south-east)
    startX: 0,    // Mouse X at interaction start (relative to visualCropContainer)
    startY: 0,    // Mouse Y at interaction start (relative to visualCropContainer)
    initialRect: null, // selectionRect at interaction start
  });
  const visualCropContainerRef = useRef(null);
  // const [gifUrl, setGifUrl] = useState(''); // URL of the converted GIF - Replaced by outputUrl

  const fileInputRef = useRef(null);
  const apiUrl = process.env.REACT_APP_API_URL;

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
  const headingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const selectBgColor = useColorModeValue("white", "gray.700"); // Moved here
  const progressBoxBgColor = useColorModeValue("gray.50", "gray.700"); // For progress indicators


  const previousVideoSrcRef = useRef(null);

  // Cleanup for local video preview URL
  useEffect(() => {
    const currentSrc = videoSrc;
    const previousSrc = previousVideoSrcRef.current;
    if (previousSrc && previousSrc.startsWith('blob:') && previousSrc !== currentSrc) {
      URL.revokeObjectURL(previousSrc);
    }
    previousVideoSrcRef.current = currentSrc;
    return () => {
      if (previousVideoSrcRef.current && previousVideoSrcRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(previousVideoSrcRef.current);
        previousVideoSrcRef.current = null;
      }
    };
  }, [videoSrc]);

  const resetStatesForNewVideo = () => {
    setVideoSrc(null);
    setUploadedFilename('');
    setVideoPlayerKey(Date.now());
    setVideoDuration(0);
    setTrim({ start: 0, end: 0 });
    setScenePoints([]);
    setCropX(null);
    setCropY(null);
    setCropW(null);
    setCropH(null);
    setShowVisualCropper(false);
    setOutputUrl(null);
    setIsUploading(false);
    setUploadProgress(0);
    setIsAnalyzing(false);
    setIsConverting(false);
    setMessage({ text: '', type: 'info' });
    setSelectedPreset(presets[0].name); // Reset to default preset
  };


  const resetConversionStates = () => { // Kept for potential specific resets if needed
    setOutputUrl('');
    setTrim({ start: 0, end: null });
    setScenePoints([]);
    setVideoDuration(0);
    setCropX(null);
    setCropY(null);
    setCropW(null);
    setCropH(null);
    setShowVisualCropper(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && ['video/mp4', 'video/avi', 'video/quicktime', 'video/webm', 'video/x-matroska'].includes(selectedFile.type)) {
      resetStatesForNewVideo();
      setFile(selectedFile);
      setVideoSrc(URL.createObjectURL(selectedFile)); // Show local preview immediately
      setVideoPlayerKey(Date.now()); // Ensure player updates for local preview

      const formData = new FormData();
      formData.append('video', selectedFile);

      setMessage({ text: 'Uploading video...', type: 'info' });
      setUploadedFilename('');
      setVideoDuration(0);
      setOutputUrl(null);
      setIsUploading(true);
      setUploadProgress(0);

      axios.post(`${apiUrl}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      })
      .then(response => {
        setUploadedFilename(response.data.filename);
        setMessage({ text: 'Video uploaded. Ready to process or convert.', type: 'success' });
        // Local preview is already showing. /analyze will use the uploadedFilename.
        // Get initial duration for local preview
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = URL.createObjectURL(selectedFile); // Use the same local blob
        video.onloadedmetadata = () => {
          setVideoDuration(video.duration);
          setTrim({ start: 0, end: video.duration });
          handleVideoMetadata({
              width: video.videoWidth,
              height: video.videoHeight,
              naturalWidth: video.videoWidth,
              naturalHeight: video.videoHeight
          });
        };
      })
      .catch(error => {
        console.error("Error uploading file:", error.response ? error.response.data : error.message);
        setMessage({ text: `Upload failed: ${error.response ? error.response.data.error : error.message}`, type: 'error' });
        setFile(null);
        setVideoSrc(null);
      })
      .finally(() => {
        setIsUploading(false);
        // setUploadProgress(0); // Or let it stay at 100
      });
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
    // Simulate file selection to reuse handleFileChange logic
    if (droppedFile) {
        const mockEvent = { target: { files: [droppedFile] } };
        handleFileChange(mockEvent);
    } else {
      setMessage({ text: 'Please drop a valid video file.', type: 'error' });
    }
  };

  const handleProcessUrl = () => {
    if (!videoUrlInput.trim()) {
      setMessage({ text: 'Please enter a video URL.', type: 'error' });
      return;
    }
    resetStatesForNewVideo();
    setMessage({ text: 'Processing URL...', type: 'info' });
    setUploadedFilename('');
    setVideoDuration(0);
    setOutputUrl(null);
    setIsAnalyzing(true); // Use isAnalyzing for URL processing as it leads to analysis

    axios.post(`${apiUrl}/process-url`, { url: videoUrlInput })
      .then(response => {
        setUploadedFilename(response.data.filename);
        setMessage({ text: `Video from URL processed: ${response.data.filename}. Ready to analyze.`, type: 'success' });
        // Trigger analysis after successful URL processing
        handleAnalyzeVideo(response.data.filename);
      })
      .catch(error => {
        console.error("Error processing URL:", error.response ? error.response.data : error.message);
        setMessage({ text: `URL processing failed: ${error.response ? error.response.data.error : error.message}`, type: 'error' });
        setIsAnalyzing(false); // Stop analyzing if URL processing fails
      });
  };

  // Renamed from handleProcessVideo to be more specific
  const handleAnalyzeVideo = async (filenameToAnalyze = uploadedFilename) => {
    if (!filenameToAnalyze) {
      setMessage({ text: 'No video selected or processed to analyze.', type: 'error' });
      return;
    }
    setMessage({ text: 'Analyzing video...', type: 'info' });
    const videoSrcPriorToAnalysis = videoSrc;
    setOutputUrl(null);
    setIsAnalyzing(true);

    try {
      const analyzeResponse = await axios.post(`${apiUrl}/analyze`, { filename: filenameToAnalyze });
      setVideoDuration(analyzeResponse.data.duration);
      setScenePoints(analyzeResponse.data.scenes || []);
      setTrim({ start: 0, end: analyzeResponse.data.duration });

      const backendPreviewUrl = analyzeResponse.data.preview_url;
      if (backendPreviewUrl) {
        setVideoSrc(backendPreviewUrl);
      } else if (videoSrcPriorToAnalysis && videoSrcPriorToAnalysis.startsWith('blob:')) {
        if (videoSrc !== videoSrcPriorToAnalysis) {
          setVideoSrc(videoSrcPriorToAnalysis);
        }
      } else {
        setVideoSrc(null);
      }
      setMessage({ text: `Video analyzed successfully. Ready to convert.`, type: 'success' });
    } catch (error) {
      console.error("Error analyzing video:", error.response ? error.response.data : error.message);
      setMessage({ text: `Analysis failed: ${error.response ? error.response.data.error : error.message}`, type: 'error' });
      setUploadedFilename('');
    } finally {
      setVideoPlayerKey(Date.now());
      setIsAnalyzing(false);
    }
  };


  const handleConvert = async () => {
    if (!uploadedFilename) {
      setMessage({ text: 'Please upload or process a video first.', type: 'error' });
      return;
    }
    setMessage({ text: 'Starting conversion...', type: 'info' });
    setOutputUrl(null);
    setIsConverting(true);

    const conversionSettings = {
      filename: uploadedFilename,
      fps,
      width,
      start_time: trim.start,
      end_time: trim.end,
      text: textOverlay || null,
      font_size: fontSize,
      text_position: textPosition,
      text_color: textColor,
      text_bg_color: textBgColor || null,
      font_style: fontStyle,
      speed_factor: speedFactor,
      reverse: reverse,
      include_audio: outputFormat === 'mp4' ? includeAudio : false, // Only include audio if output is MP4
      output_format: includeAudio ? 'mp4' : 'gif', // Determine format based on audio
      crop_x: cropX,
      crop_y: cropY,
      crop_w: cropW,
      crop_h: cropH,
    };
    setOutputFormat(includeAudio ? 'mp4' : 'gif'); // Update outputFormat state for UI text

    try {
      const response = await axios.post(`${apiUrl}/convert`, conversionSettings);
      setMessage({ text: `Successfully converted to ${outputFormat.toUpperCase()}!`, type: 'success' });
      setOutputUrl(response.data.url);
      setVideoPlayerKey(Date.now());
    } catch (error) {
      console.error("Error converting video:", error.response ? error.response.data : error.message);
      setMessage({ text: `Conversion failed: ${error.response ? error.response.data.error : error.message}`, type: 'error' });
    } finally {
      setIsConverting(false);
    }
  };

  const handleTrimChange = ({ start, end }) => {
    setTrim({ start, end });
  };

  const handleVideoMetadata = useCallback(({ width, height, naturalWidth, naturalHeight }) => {
    setVideoPreviewDimensions({ width, height, naturalWidth, naturalHeight });

    if (naturalWidth > 0 && naturalHeight > 0) {
        const initialX = 0;
        const initialY = 0;
        const initialSelectionWidth = naturalWidth;
        const initialSelectionHeight = naturalHeight;

        handleVisualCropChange({
            x: initialX,
            y: initialY,
            width: initialSelectionWidth,
            height: initialSelectionHeight,
            selectionNaturalWidth: naturalWidth,
            selectionNaturalHeight: naturalHeight
        });
    } else {
        handleVisualCropChange({
            x: 0, y: 0, width: 0, height: 0,
            selectionNaturalWidth: 0, selectionNaturalHeight: 0
        });
    }
  }, [/* handleVisualCropChange will be defined below or needs to be memoized if passed as prop */]);


  const handleVisualCropChange = useCallback((newRect) => {
    const minDimension = 10;
    const validatedRect = {
        x: Math.round(newRect.x ?? 0),
        y: Math.round(newRect.y ?? 0),
        width: Math.round(newRect.width ?? minDimension),
        height: Math.round(newRect.height ?? minDimension),
        selectionNaturalWidth: newRect.selectionNaturalWidth,
        selectionNaturalHeight: newRect.selectionNaturalHeight,
    };

    validatedRect.width = Math.max(minDimension, validatedRect.width);
    validatedRect.height = Math.max(minDimension, validatedRect.height);

    if (validatedRect.selectionNaturalWidth > 0 && validatedRect.selectionNaturalHeight > 0) {
        validatedRect.x = Math.max(0, validatedRect.x);
        validatedRect.y = Math.max(0, validatedRect.y);

        if (validatedRect.x + validatedRect.width > validatedRect.selectionNaturalWidth) {
            validatedRect.x = validatedRect.selectionNaturalWidth - validatedRect.width;
        }
        if (validatedRect.y + validatedRect.height > validatedRect.selectionNaturalHeight) {
            validatedRect.y = validatedRect.selectionNaturalHeight - validatedRect.height;
        }
        validatedRect.x = Math.max(0, validatedRect.x);
        validatedRect.y = Math.max(0, validatedRect.y);

        validatedRect.width = Math.min(validatedRect.width, validatedRect.selectionNaturalWidth - validatedRect.x);
        validatedRect.height = Math.min(validatedRect.height, validatedRect.selectionNaturalHeight - validatedRect.y);
    }

    setCropX(validatedRect.x);
    setCropY(validatedRect.y);
    setCropW(validatedRect.width);
    setCropH(validatedRect.height);
    setSelectionRect(validatedRect);
  }, []);


  useEffect(() => {
    if (!interaction.type || !visualCropContainerRef.current) return;
    const containerRect = visualCropContainerRef.current.getBoundingClientRect();
    const handleDocumentMouseMove = (e) => {
      e.preventDefault();
      const mouseXInContainer = e.clientX - containerRect.left;
      const mouseYInContainer = e.clientY - containerRect.top;
      const { initialRect, startX, startY, type, handle } = interaction;
      if (!initialRect) return;
      const displayWidth = videoPreviewDimensions.width;
      const displayHeight = videoPreviewDimensions.height;
      const naturalWidth = initialRect.selectionNaturalWidth;
      const naturalHeight = initialRect.selectionNaturalHeight;
      if (displayWidth === 0 || displayHeight === 0 || naturalWidth === 0 || naturalHeight === 0) return;
      const scaleX = naturalWidth / displayWidth;
      const scaleY = naturalHeight / displayHeight;
      const deltaXOriginal = (mouseXInContainer - startX) * scaleX;
      const deltaYOriginal = (mouseYInContainer - startY) * scaleY;
      let newRect = { ...initialRect };
      if (type === 'drag') {
        newRect.x = Math.round(initialRect.x + deltaXOriginal);
        newRect.y = Math.round(initialRect.y + deltaYOriginal);
      } else if (type === 'resize') {
        const { x: ix, y: iy, width: iw, height: ih } = initialRect;
        const minDim = 10;
        if (handle.includes('e')) {
          newRect.width = Math.max(minDim, Math.round(iw + deltaXOriginal));
        }
        if (handle.includes('w')) {
          const newWidth = Math.max(minDim, Math.round(iw - deltaXOriginal));
          newRect.x = Math.round(ix + (iw - newWidth));
          newRect.width = newWidth;
        }
        if (handle.includes('s')) {
          newRect.height = Math.max(minDim, Math.round(ih + deltaYOriginal));
        }
        if (handle.includes('n')) {
          const newHeight = Math.max(minDim, Math.round(ih - deltaYOriginal));
          newRect.y = Math.round(iy + (ih - newHeight));
          newRect.height = newHeight;
        }
      }
      handleVisualCropChange(newRect);
    };
    const handleDocumentMouseUp = (e) => {
      e.preventDefault();
      setInteraction({ type: null, handle: null, startX: 0, startY: 0, initialRect: null });
    };
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [interaction, videoPreviewDimensions, handleVisualCropChange]);

  const startInteraction = (e, type, handle = 'body') => {
    e.preventDefault();
    e.stopPropagation();
    if (!visualCropContainerRef.current) return;
    const containerRect = visualCropContainerRef.current.getBoundingClientRect();
    const startX = e.clientX - containerRect.left;
    const startY = e.clientY - containerRect.top;
    setInteraction({ type, handle, startX, startY, initialRect: { ...selectionRect } });
  };

  const fontStyleOptions = ["Arial", "Times New Roman", "Courier New", "Verdana", "Georgia", "Comic Sans MS"];

    // Handler for preset selection
  const handlePresetChange = (e) => {
    const presetName = e.target.value;
    setSelectedPreset(presetName);
    const preset = presets.find(p => p.name === presetName);
    if (preset) {
      setFps(preset.settings.fps);
      setWidth(preset.settings.width);
      setIncludeAudio(preset.settings.includeAudio);
      setSpeedFactor(preset.settings.speedFactor);
      setReverse(preset.settings.reverse);
      setOutputFormat(preset.settings.includeAudio ? 'mp4' : 'gif'); // Update outputFormat based on preset's audio
      // Note: Trim, Crop, and Text Overlay are not typically part of presets, so they are not reset here.
    }
  };

  // Loading and Progress Indicators Section
  let progressIndicator = null;
  if (isUploading) {
    progressIndicator = (
      <Box my={4} p={3} borderWidth="1px" borderRadius="lg" bg={progressBoxBgColor}>
        <Text mb={1} fontSize="sm">Uploading: {uploadProgress}%</Text>
        <Progress value={uploadProgress} size="sm" colorScheme="blue" hasStripe isAnimated={uploadProgress < 100} />
      </Box>
    );
  } else if (isAnalyzing) {
    progressIndicator = (
      <Box my={4} p={3} borderWidth="1px" borderRadius="lg" bg={progressBoxBgColor}>
        <Text mb={1} fontSize="sm">Analyzing video...</Text>
        <Progress size="sm" isIndeterminate colorScheme="purple" />
      </Box>
    );
  } else if (isConverting) {
    progressIndicator = (
      <Box my={4} p={3} borderWidth="1px" borderRadius="lg" bg={progressBoxBgColor}>
        <Text mb={1} fontSize="sm">Converting video...</Text>
        <Progress size="sm" isIndeterminate colorScheme="green" />
      </Box>
    );
  }

  const liveTextOverlayProps = (textOverlay && videoSrc && !outputUrl && !showVisualCropper) ? {
    text: textOverlay,
    fontSize: fontSize,
    position: textPosition,
    color: textColor,
    bgColor: textBgColor,
    fontStyle: fontStyle,
  } : null;
  
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
      {/* Display Progress Indicators */}
      {progressIndicator}


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
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
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
                // resetConversionStates(); // Full reset might be too much here, let resetStatesForNewVideo handle it in handleProcessUrl
                setUploadedFilename('');
              }
            }}
            focusBorderColor="blue.500"
            size="lg"
          />
        </FormControl>

        <Button
          onClick={file ? () => handleAnalyzeVideo() : handleProcessUrl} // Decide action based on input
          isDisabled={(!file && !videoUrlInput) || isUploading || isAnalyzing || isConverting}
          colorScheme="green"
          size="lg"
          w="full"
          isLoading={isUploading || (isAnalyzing && !outputUrl)} // Show spinner during upload or initial analysis
          spinner={<Spinner size="md" />}
          leftIcon={(isUploading || (isAnalyzing && !outputUrl)) ? undefined : <Icon as={FiUploadCloud} />}
        >
          {(isUploading || (isAnalyzing && !outputUrl)) ? 'Processing...' : 'Process Video'}
        </Button>
      </VStack>

      {/* Preset Selection Dropdown - Placed before detailed settings */}
      {uploadedFilename && videoDuration > 0 && (
        <FormControl mb={8} id="preset-selection">
          <FormLabel htmlFor="presetSelect" color={labelColor} fontWeight="medium">Quick Presets</FormLabel>
          <Select id="presetSelect" value={selectedPreset} onChange={handlePresetChange} focusBorderColor="blue.500" size="lg" bg={selectBgColor}>
            {presets.map(preset => (
              <option key={preset.name} value={preset.name}>
                {preset.name}
              </option>
            ))}
          </Select>
        </FormControl>
      )}

       {/* Video Preview Area - show if videoSrc is available and no outputUrl is generated, OR if visual cropper is active */}
      {(videoSrc && !outputUrl && !showVisualCropper) && (
        <VideoPlayer
          key={videoPlayerKey}
          src={videoSrc}
          onMetadataLoaded={handleVideoMetadata}
          liveTextOverlay={liveTextOverlayProps}
        />
      )}

      {showVisualCropper && videoSrc && videoPreviewDimensions.naturalWidth > 0 && !isUploading && !isAnalyzing && !isConverting && (
        <Box my={4} p={4} borderWidth="1px" borderRadius="lg" borderColor="blue.500">
            <Heading size="md" mb={2}>Visual Crop</Heading>
            <Text mb={2}>Video Dimensions: {videoPreviewDimensions.naturalWidth}x{videoPreviewDimensions.naturalHeight} (Original)</Text>
            <Text mb={4}>Displayed Preview Dimensions: {videoPreviewDimensions.width}x{videoPreviewDimensions.height}</Text>
            <Box
                position="relative"
                width={`${videoPreviewDimensions.width}px`}
                height={`${videoPreviewDimensions.height}px`}
                mx="auto"
                border="2px dashed gray"
                ref={visualCropContainerRef}
                overflow="hidden"
            >
                <video
                    src={videoSrc}
                    style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
                    controls={false}
                    autoPlay={false}
                    muted
                />
                <Box
                    position="absolute"
                    border="2px solid blue"
                    bg="rgba(0,0,255,0.2)"
                    style={{
                        left: videoPreviewDimensions.width > 0 && selectionRect.selectionNaturalWidth > 0 ? `${(selectionRect.x / selectionRect.selectionNaturalWidth) * videoPreviewDimensions.width}px` : '0px',
                        top: videoPreviewDimensions.height > 0 && selectionRect.selectionNaturalHeight > 0 ? `${(selectionRect.y / selectionRect.selectionNaturalHeight) * videoPreviewDimensions.height}px` : '0px',
                        width: videoPreviewDimensions.width > 0 && selectionRect.selectionNaturalWidth > 0 ? `${(selectionRect.width / selectionRect.selectionNaturalWidth) * videoPreviewDimensions.width}px` : '0px',
                        height: videoPreviewDimensions.height > 0 && selectionRect.selectionNaturalHeight > 0 ? `${(selectionRect.height / selectionRect.selectionNaturalHeight) * videoPreviewDimensions.height}px` : '0px',
                        cursor: 'move',
                        display: (selectionRect.width <=0 || selectionRect.height <=0) ? 'none' : 'block',
                    }}
                    onMouseDown={(e) => startInteraction(e, 'drag')}
                >
                    {['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].map(handleName => {
                        const handleSize = "12px";
                        const handleOffset = "-6px";
                        let handleStyle = {};
                        if (handleName.includes('n')) handleStyle.top = handleOffset;
                        if (handleName.includes('s')) handleStyle.bottom = handleOffset;
                        if (handleName.includes('w')) handleStyle.left = handleOffset;
                        if (handleName.includes('e')) handleStyle.right = handleOffset;
                        if (handleName === 'n' || handleName === 's') {
                            handleStyle.left = '50%';
                            handleStyle.transform = 'translateX(-50%)';
                        }
                        if (handleName === 'w' || handleName === 'e') {
                            handleStyle.top = '50%';
                            handleStyle.transform = 'translateY(-50%)';
                        }
                        if (handleName === 'nw') { handleStyle.cursor = 'nwse-resize'; }
                        else if (handleName === 'ne') { handleStyle.cursor = 'nesw-resize'; }
                        else if (handleName === 'sw') { handleStyle.cursor = 'nesw-resize'; }
                        else if (handleName === 'se') { handleStyle.cursor = 'nwse-resize'; }
                        else if (handleName === 'n' || handleName === 's') { handleStyle.cursor = 'ns-resize'; }
                        else if (handleName === 'w' || handleName === 'e') { handleStyle.cursor = 'ew-resize'; }
                        return (
                            <Box
                                key={handleName}
                                position="absolute"
                                width={handleSize}
                                height={handleSize}
                                bg="blue.600"
                                border="1px solid white"
                                borderRadius="2px"
                                style={handleStyle}
                                onMouseDown={(e) => startInteraction(e, 'resize', handleName)}
                            />
                        );
                    })}
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
              // value={trim} // TrimSlider manages its own internal start/end based on duration
              onTrimChange={handleTrimChange}
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
                isDisabled={!videoSrc || videoPreviewDimensions.naturalWidth === 0 || isUploading || isAnalyzing || isConverting}
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
            isLoading={isConverting}
            spinner={<Spinner size="md" />}
            leftIcon={isConverting ? undefined : <Icon as={FiUploadCloud} transform="rotate(90deg)" />}
            isDisabled={isUploading || isAnalyzing || isConverting}
          >
            {isConverting ? 'Converting...' : `Convert to ${outputFormat.toUpperCase()}`}
          </Button>
        </Box>
      )}

      {outputUrl && (
        <Box mt={10} p={{base: 4, md: 6}} borderWidth="1px" borderRadius="lg" shadow="xl" bg={gifResultBoxBg}>
          <Heading as="h3" size="lg" mb={6} textAlign="center" color={resultHeadingColor}>
            Your {outputFormat.toUpperCase()} is Ready!
          </Heading>
          <Box borderRadius="md" overflow="hidden">
            <Center>
              {outputFormat === 'mp4' ? (
                <VideoPlayer
                  key={outputUrl}
                  src={outputUrl}
                  onMetadataLoaded={() => {}}
                  liveTextOverlay={null}
                />
              ) : (
                <Image src={outputUrl} alt={`Converted ${outputFormat.toUpperCase()}`} maxW="full" borderRadius="md" />
              )}
            </Center>
          </Box>
          <Link href={outputUrl} download isExternal _hover={{textDecoration: 'none'}}>
            <Button colorScheme="teal" size="lg" w="full" mt={6} leftIcon={<Icon as={FiUploadCloud} transform="rotate(180deg)" />}>
              Download {outputFormat.toUpperCase()}
            </Button>
          </Link>
        </Box>
      )}
    </Box>
  );
}

export default Upload;
