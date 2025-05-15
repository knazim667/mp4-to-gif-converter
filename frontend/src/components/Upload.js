import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
// import TrimSlider from './TrimSlider'; // Now part of ConversionSettingsOrchestrator
import {
  Box, Heading, Text, Button, Input, FormControl, FormLabel, Checkbox, HStack,
  SimpleGrid, Center, Image, Link, useColorModeValue, Select, VStack,
  Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Spinner, Progress,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Divider, Icon
} from '@chakra-ui/react';
import { FiUploadCloud } from 'react-icons/fi'; // Example icon
import FileUploadZone from './FileUploadZone';
import OutputDisplay from './OutputDisplay';
import ConversionSettingsOrchestrator from './ConversionSettingsOrchestrator';

/*
Upcoming Features & Potential Enhancements:

* Real-time Previews:
    * Live preview for text overlay adjustments (font, size, color, position).
    * Attempt real-time feedback for some simpler effects.
* Granular Progress Indicators:
    * Detailed progress bars for file uploads (percentage).
    * Step-by-step progress updates during the conversion process (e.g., "Trimming...", "Applying effects...", "Encoding...").
* Preset Options:
    * Pre-defined configurations for common use cases (e.g., "High-Quality GIF," "Small Email GIF," "Social Media MP4").
* Additional Video Effects/Filters:
    * Brightness, contrast, saturation adjustments.
    * Grayscale, Sepia filters.
* Enhanced Visual Cropper:
    * Aspect ratio locking for crop selection.
    * Real-time display of numeric crop values (X, Y, W, H) during visual selection.
    * Snapping options (to edges, center).
* Componentization of Settings:
    * Refactor large UI sections (e.g., Output Options, Crop, Text Overlay, Effects) into smaller, more manageable React components.
* User Configurations/Templates:
    * Allow users to save their current set of conversion settings as a template.
    * Ability to load saved templates for frequent tasks.
* Advanced GIF Options:
    * Dithering options for better color quality in GIFs.
    * Loop count control.
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
    setFile(null); // Added this - should reset file state too
    setVideoUrlInput(''); // Added this - should reset url input too
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
    setTextOverlay(''); // Also reset text overlay settings
    setFontSize(20);
    setTextPosition('center');
    setTextColor('white');
    setTextBgColor('');
    setFontStyle('Arial');
    setSpeedFactor(presets[0].settings.speedFactor);
    setReverse(presets[0].settings.reverse);
    setIncludeAudio(presets[0].settings.includeAudio);
    setOutputFormat(presets[0].settings.outputFormat);
  };


  const resetConversionStates = () => { // Kept for potential specific resets if needed
    setOutputUrl('');
    // trim, scenePoints, videoDuration are related to video analysis, not just conversion state
    // setTrim({ start: 0, end: null }); // Might not want to reset trim here
    // setScenePoints([]); // Might not want to reset scenes here
    // setVideoDuration(0); // Might not want to reset duration here
    setCropX(null);
    setCropY(null);
    setCropW(null);
    setCropH(null);
    setShowVisualCropper(false);
    // Don't reset text overlay, effects, output options here as they are settings for conversion
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && ['video/mp4', 'video/avi', 'video/quicktime', 'video/webm', 'video/x-matroska'].includes(selectedFile.type)) {
      resetStatesForNewVideo(); // Reset all states for a new video
      setFile(selectedFile);
      setVideoSrc(URL.createObjectURL(selectedFile)); // Show local preview immediately
      setVideoPlayerKey(Date.now()); // Ensure player updates for local preview

      const formData = new FormData();
      formData.append('video', selectedFile);

      setMessage({ text: 'Uploading video...', type: 'info' });
      // setUploadedFilename(''); // Already in resetStatesForNewVideo
      // setVideoDuration(0); // Already in resetStatesForNewVideo
      // setOutputUrl(null); // Already in resetStatesForNewVideo
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
         video.onerror = () => {
            console.error("Error loading video metadata from local file.");
            setMessage({ text: "Could not load video metadata. Try a different file or URL.", type: 'error' });
            // Optionally reset states if metadata loading fails
            // resetStatesForNewVideo();
         };
      })
      .catch(error => {
        console.error("Error uploading file:", error.response ? error.response.data : error.message);
        setMessage({ text: `Upload failed: ${error.response ? error.response.data.error : error.message}`, type: 'error' });
        // setFile(null); // Already in resetStatesForNewVideo
        // setVideoSrc(null); // Already in resetStatesForNewVideo
        resetStatesForNewVideo(); // Ensure all states are reset on upload failure
      })
      .finally(() => {
        setIsUploading(false);
        // setUploadProgress(0); // Or let it stay at 100
      });
      // setVideoUrlInput(''); // Already in resetStatesForNewVideo
    } else {
      // setFile(null); // Already in resetStatesForNewVideo
      // setVideoSrc(null); // Already in resetStatesForNewVideo
      resetStatesForNewVideo(); // Reset all states on invalid file selection
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
    resetStatesForNewVideo(); // Reset all states for a new video
    setMessage({ text: 'Processing URL...', type: 'info' });
    // setUploadedFilename(''); // Already in resetStatesForNewVideo
    // setVideoDuration(0); // Already in resetStatesForNewVideo
    // setOutputUrl(null); // Already in resetStatesForNewVideo
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
        resetStatesForNewVideo(); // Ensure all states are reset on URL processing failure
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
    // setOutputUrl(null); // Already in resetStatesForNewVideo or resetConversionStates if used after initial load
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
        // If no backend preview, try to keep the local preview if it exists
        if (videoSrc !== videoSrcPriorToAnalysis) {
          setVideoSrc(videoSrcPriorToAnalysis);
        }
      } else {
        setVideoSrc(null); // No preview available
      }
       // Update video dimensions after analysis as backend might provide them or we use the current videoSrc
      const video = document.createElement('video');
       video.preload = 'metadata';
       video.src = backendPreviewUrl || videoSrcPriorToAnalysis; // Use backend URL or local blob
       video.onloadedmetadata = () => {
            handleVideoMetadata({
                width: video.videoWidth,
                height: video.videoHeight,
                naturalWidth: video.videoWidth,
                naturalHeight: video.videoHeight
            });
             video.remove(); // Clean up the temporary video element
        };
        video.onerror = () => {
             console.error("Error loading video metadata after analysis.");
             // Proceed without dimensions or handle error appropriately
             video.remove(); // Clean up the temporary video element
        };
        // If video is already loaded (e.g., local preview), metadata might be available immediately
         if (video.readyState >= 1) {
            handleVideoMetadata({
                width: video.videoWidth,
                height: video.videoHeight,
                naturalWidth: video.videoWidth,
                naturalHeight: video.videoHeight
            });
             video.remove(); // Clean up the temporary video element
         }


      setMessage({ text: `Video analyzed successfully. Ready to convert.`, type: 'success' });
    } catch (error) {
      console.error("Error analyzing video:", error.response ? error.response.data : error.message);
      setMessage({ text: `Analysis failed: ${error.response ? error.response.data.error : error.message}`, type: 'error' });
      setUploadedFilename(''); // Clear filename if analysis fails
      setVideoSrc(null); // Clear video source on analysis failure
      setVideoDuration(0); // Reset duration
      setTrim({ start: 0, end: 0 }); // Reset trim
      setScenePoints([]); // Reset scenes
      setVideoPreviewDimensions({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 }); // Reset dimensions
       setCropX(null); setCropY(null); setCropW(null); setCropH(null); // Reset crop
       setShowVisualCropper(false); // Hide cropper
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
     if (isUploading || isAnalyzing || isConverting) {
         console.log("Conversion already in progress or busy.");
         return; // Prevent multiple clicks while busy
     }

    setMessage({ text: 'Starting conversion...', type: 'info' });
    setOutputUrl(null);
    setIsConverting(true);

    // Determine output format based on includeAudio state
    const finalOutputFormat = includeAudio ? 'mp4' : 'gif';
    setOutputFormat(finalOutputFormat); // Update outputFormat state for UI text

    const conversionSettings = {
      filename: uploadedFilename,
      fps,
      width,
      start_time: trim.start,
      end_time: trim.end,
      text: textOverlay || null, // Send null if textOverlay is empty
      font_size: fontSize,
      text_position: textPosition,
      text_color: textColor,
      text_bg_color: textBgColor || null, // Send null if textBgColor is empty
      font_style: fontStyle,
      speed_factor: speedFactor,
      reverse: reverse,
      include_audio: finalOutputFormat === 'mp4', // Only include audio if output is MP4
      output_format: finalOutputFormat,
      crop_x: cropX,
      crop_y: cropY,
      crop_w: cropW,
      crop_h: cropH,
    };


    try {
      const response = await axios.post(`${apiUrl}/convert`, conversionSettings);
      setMessage({ text: `Successfully converted to ${finalOutputFormat.toUpperCase()}!`, type: 'success' });
      setOutputUrl(response.data.url);
      setVideoPlayerKey(Date.now()); // Re-key to update player with new output
    } catch (error) {
      console.error("Error converting video:", error.response ? error.response.data : error.message);
      setMessage({ text: `Conversion failed: ${error.response ? error.response.data.error : error.message}`, type: 'error' });
      setOutputUrl(null); // Clear output URL on conversion failure
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

        // Call handleVisualCropChange to initialize selectionRect based on video metadata
        // This also sets the cropX,Y,W,H states
        handleVisualCropChange({
            x: initialX,
            y: initialY,
            width: initialSelectionWidth,
            height: initialSelectionHeight,
            selectionNaturalWidth: naturalWidth,
            selectionNaturalHeight: naturalHeight
        });
    } else {
         // Reset crop and selection if dimensions are invalid
        handleVisualCropChange({
            x: 0, y: 0, width: 0, height: 0,
            selectionNaturalWidth: 0, selectionNaturalHeight: 0
        });
    }
    // This useCallback itself does not depend on handleVisualCropChange
    // as handleVisualCropChange is also a useCallback that is stable
  }, []);


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

    // Ensure minimum dimensions
    validatedRect.width = Math.max(minDimension, validatedRect.width);
    validatedRect.height = Math.max(minDimension, validatedRect.height);

    if (validatedRect.selectionNaturalWidth > 0 && validatedRect.selectionNaturalHeight > 0) {
        // Clamp position to prevent exceeding bounds
        validatedRect.x = Math.max(0, Math.min(validatedRect.x, validatedRect.selectionNaturalWidth - validatedRect.width));
        validatedRect.y = Math.max(0, Math.min(validatedRect.y, validatedRect.selectionNaturalHeight - validatedRect.height));

        // Re-calculate size based on clamped position and natural dimensions
         validatedRect.width = Math.min(validatedRect.width, validatedRect.selectionNaturalWidth - validatedRect.x);
        validatedRect.height = Math.min(validatedRect.height, validatedRect.selectionNaturalHeight - validatedRect.y);
    }

    // Update states. These are stable setters and don't need to be in useCallback dependencies.
    setCropX(validatedRect.x);
    setCropY(validatedRect.y);
    setCropW(validatedRect.width);
    setCropH(validatedRect.height);
    // selectionRect is local state managed by this hook, updating it here is fine
    setSelectionRect(validatedRect);

  }, []); // Dependency array is empty as state setters and local state (selectionRect) are stable


  useEffect(() => {
    // Update crop state when visual cropper is hidden.
    // When visual cropper is shown, handleVideoMetadata initializes crop via handleVisualCropChange.
    // This useEffect ensures that when you switch back to numerical inputs,
    // the numerical inputs reflect the last visual selection.
    if (!showVisualCropper && videoPreviewDimensions.naturalWidth > 0 && videoPreviewDimensions.naturalHeight > 0) {
        // Use a slight delay to ensure selectionRect is updated after the last mouseup event
        const updateCrop = setTimeout(() => {
             setCropX(selectionRect.x);
             setCropY(selectionRect.y);
             setCropW(selectionRect.width);
             setCropH(selectionRect.height);
        }, 0); // A small delay like 0 or a few ms can sometimes help

        return () => clearTimeout(updateCrop);

    } else if (!videoSrc) {
        // Reset crop and selection when no video source
         setCropX(null); setCropY(null); setCropW(null); setCropH(null);
         setSelectionRect({ x: 0, y: 0, width: 0, height: 0, selectionNaturalWidth: 0, selectionNaturalHeight: 0 });
    }
     // Depend on showVisualCropper, videoPreviewDimensions, selectionRect, videoSrc
  }, [showVisualCropper, videoPreviewDimensions, selectionRect, videoSrc]);


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
      // Ensure scale factors are not zero to avoid division by zero
      const scaleX = displayWidth > 0 ? naturalWidth / displayWidth : 0;
      const scaleY = displayHeight > 0 ? naturalHeight / displayHeight : 0;

      if (scaleX === 0 || scaleY === 0) {
          console.warn("Scale factors are zero, cannot calculate crop accurately.");
          return; // Prevent calculations if scales are zero
      }

      const deltaXOriginal = (mouseXInContainer - startX) * scaleX;
      const deltaYOriginal = (mouseYInContainer - startY) * scaleY;
      let newRect = { ...initialRect };
      if (type === 'drag') {
        newRect.x = Math.round(initialRect.x + deltaXOriginal);
        newRect.y = Math.round(initialRect.y + deltaYOriginal);
      } else if (type === 'resize') {
        const { x: ix, y: iy, width: iw, height: ih } = initialRect;
        const minDim = 10;
        // Calculate potential new dimensions *before* clamping
        let potentialNewWidth = iw;
        let potentialNewHeight = ih;
        let potentialNewX = ix;
        let potentialNewY = iy;

        if (handle.includes('e')) {
          potentialNewWidth = Math.round(iw + deltaXOriginal);
        }
        if (handle.includes('w')) {
          potentialNewWidth = Math.round(iw - deltaXOriginal);
          potentialNewX = Math.round(ix + (iw - potentialNewWidth));
        }
        if (handle.includes('s')) {
          potentialNewHeight = Math.round(ih + deltaYOriginal);
        }
        if (handle.includes('n')) {
          potentialNewHeight = Math.round(ih - deltaYOriginal);
           potentialNewY = Math.round(iy + (ih - potentialNewHeight));
        }

         // Apply minimum dimension clamp
        newRect.width = Math.max(minDim, potentialNewWidth);
        newRect.height = Math.max(minDim, potentialNewHeight);
        newRect.x = potentialNewX;
        newRect.y = potentialNewY;

      }
       // After calculating the potential new rect, validate and clamp it
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
  }, [interaction, videoPreviewDimensions, handleVisualCropChange]); // Depend on interaction and dimensions


  const startInteraction = (e, type, handle = 'body') => {
    e.preventDefault();
    e.stopPropagation();
    if (!visualCropContainerRef.current) return;
     if (isProcessing) return; // Prevent interaction if processing

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

  // Combined loading state for disabling controls
  const isProcessing = isUploading || isAnalyzing || isConverting;


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
    // Ensure color and bgColor are passed correctly, even if empty
    // The VideoPlayer component should handle default values if these are null/undefined
    // For example, if textColor is an empty string, VideoPlayer might default to 'white'.
    // If textBgColor is empty, VideoPlayer might default to 'transparent'.
    // This depends on VideoPlayer's internal logic.
    color: textColor,
    bgColor: textBgColor,
    fontStyle: fontStyle,
  } : null;

  return (
    // Apply maxWidth to the main container for overall width control
    <Box
      bg={mainBg}
      borderRadius="xl"
      boxShadow="lg"
      p={{ base: 4, md: 8 }}
      color={mainText}
      maxW="48rem" // Adjust this value to control the overall width (e.g., "60rem", "900px")
      mx="auto" // Center the container on the page
      w="full" // Ensure it takes full width up to maxW
    >
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

      <FileUploadZone
        file={file}
        videoUrlInput={videoUrlInput}
        isDragging={isDragging}
        onFileChange={handleFileChange}
        onVideoUrlInputChange={(e) => {
          setVideoUrlInput(e.target.value);
          if (e.target.value) {
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setUploadedFilename('');
            setVideoSrc(null); // Clear local preview when entering URL
             setVideoDuration(0); // Reset duration
             setTrim({ start: 0, end: 0 }); // Reset trim
             setScenePoints([]); // Reset scenes
             setVideoPreviewDimensions({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 }); // Reset dimensions
             setCropX(null); setCropY(null); setCropW(null); setCropH(null); // Reset crop
             setShowVisualCropper(false); // Hide cropper
             setOutputUrl(null); // Clear output
             // Keep text overlay, effects, output options as they might be desired for the URL conversion
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onBrowseClick={() => fileInputRef.current && fileInputRef.current.click()}
        fileInputRef={fileInputRef}
      />
      <VStack spacing={6} align="stretch" mb={8}>
        <Button
          onClick={file ? () => handleAnalyzeVideo() : handleProcessUrl} // Decide action based on input
          isDisabled={(!file && !videoUrlInput) || isProcessing || (!file && videoUrlInput.trim() === '')} // Disable if no input or processing
          colorScheme="green"
          size="lg"
          w="full"
          isLoading={isProcessing} // Show spinner for any processing
          spinner={<Spinner size="md" />}
          leftIcon={isProcessing ? undefined : <Icon as={FiUploadCloud} />}
        >
          {isProcessing ? 'Processing...' : 'Process Video'}
        </Button>
      </VStack>

       {/* Video Preview Area - show if videoSrc is available and no outputUrl is generated, OR if visual cropper is active */}
      {(videoSrc && !outputUrl && !showVisualCropper) && (
        <VideoPlayer
          key={videoPlayerKey}
          src={videoSrc}
          onMetadataLoaded={handleVideoMetadata}
          liveTextOverlay={liveTextOverlayProps}
        />
      )}

      {showVisualCropper && videoSrc && videoPreviewDimensions.naturalWidth > 0 && !isProcessing && ( // Disable visual cropper when processing
        <Box my={4} p={4} borderWidth="1px" borderRadius="lg" borderColor="blue.500" maxW="full" overflowX="auto"> {/* Added maxW="full" and overflowX="auto" */}
            <Heading size="md" mb={2}>Visual Crop</Heading>
            {videoPreviewDimensions.naturalWidth > 0 && (
                <Text mb={2}>Video Dimensions: {videoPreviewDimensions.naturalWidth}x{videoPreviewDimensions.naturalHeight} (Original)</Text>
            )}
             {videoPreviewDimensions.width > 0 && videoPreviewDimensions.height > 0 && (
                <Text mb={4}>Displayed Preview Dimensions: {videoPreviewDimensions.width}x{videoPreviewDimensions.height}</Text>
             )}
             {(videoPreviewDimensions.width > 0 && videoPreviewDimensions.height > 0 && videoSrc) ? ( // Only show the cropper box if dimensions are valid
                <Box
                    position="relative"
                    width={`${videoPreviewDimensions.width}px`}
                    height={`${videoPreviewDimensions.height}px`}
                    mx="auto"
                    border="2px dashed gray"
                    ref={visualCropContainerRef}
                    overflow="hidden"
                    maxW="full" // Added maxW="full" here as well
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
             ) : (
                 <Text color="gray.500" textAlign="center">Video preview not available for visual cropping.</Text>
             )}
            {/* Display current crop values relative to original dimensions */}
            <Text mt={2} fontSize="sm">Current Crop (Original Dims): X={cropX !== null ? cropX : 'N/A'}, Y={cropY !== null ? cropY : 'N/A'}, W={cropW !== null ? cropW : 'N/A'}, H={cropH !== null ? cropH : 'N/A'}</Text>
        </Box>
      )}


      {/* Conversion Settings Section */}
      {uploadedFilename && videoDuration > 0 && (
        <ConversionSettingsOrchestrator
          videoDuration={videoDuration}
          trim={trim}
          onTrimChange={handleTrimChange}
          scenePoints={scenePoints}
          fps={fps} setFps={setFps}
          width={width} setWidth={setWidth}
          includeAudio={includeAudio} setIncludeAudio={setIncludeAudio}
          showVisualCropper={showVisualCropper} setShowVisualCropper={setShowVisualCropper}
          videoSrc={videoSrc}
          videoPreviewDimensions={videoPreviewDimensions}
          isProcessing={isProcessing} // Pass combined processing state
          cropX={cropX} setCropX={setCropX}
          cropY={cropY} setCropY={setCropY}
          cropW={cropW} setCropW={setCropW}
          cropH={cropH} setCropH={cropH}
          textOverlay={textOverlay} setTextOverlay={setTextOverlay}
          fontSize={fontSize} setFontSize={setFontSize}
          fontStyle={fontStyle} setFontStyle={setFontStyle} fontStyleOptions={fontStyleOptions}
          textColor={textColor} setTextColor={setTextColor}
          textBgColor={textBgColor} setTextBgColor={setTextBgColor}
          textPosition={textPosition} setTextPosition={setTextPosition}
          speedFactor={speedFactor} setSpeedFactor={setSpeedFactor}
          reverse={reverse} setReverse={setReverse}
          presets={presets}
          selectedPreset={selectedPreset}
          onPresetChange={handlePresetChange}
        />
      )}

      {/* Convert Button - Placed after settings if settings are visible */}
      {uploadedFilename && videoDuration > 0 && (
        <>
          <Divider my={10} />
          <Button
            onClick={handleConvert}
            colorScheme="purple"
            size="lg"
            w="full"
            isLoading={isConverting}
            spinner={<Spinner size="md" />}
            leftIcon={isConverting ? undefined : <Icon as={FiUploadCloud} transform="rotate(90deg)" />}
            isDisabled={isProcessing} // Disable convert button if any processing is happening
          >
            {isConverting ? 'Converting...' : `Convert to ${outputFormat.toUpperCase()}`}
          </Button>
        </>
      )}

      <OutputDisplay
        outputUrl={outputUrl}
        outputFormat={outputFormat}
        liveTextOverlay={null} // No live overlay for the final output
      />
    </Box>
  );
}

export default Upload;