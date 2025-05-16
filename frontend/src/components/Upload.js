import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
import {
  Box, Heading, Text, Button, Input, FormControl, FormLabel, Checkbox, HStack,
  SimpleGrid, Center, Image, Link, useColorModeValue, Select, VStack,
  Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Spinner, Progress,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, Divider, Icon
} from '@chakra-ui/react';
import { FiUploadCloud } from 'react-icons/fi';
import FileUploadZone from './FileUploadZone';
import OutputDisplay from './OutputDisplay';
import ConversionSettingsOrchestrator from './ConversionSettingsOrchestrator';

function Upload() {

    // Define Preset Configurations
  const presets = [
    {
      name: "Default (Custom)",
      settings: { fps: 10, width: 320, includeAudio: false, speedFactor: 1.0, reverse: false, outputFormat: 'gif' }
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
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [videoPlayerKey, setVideoPlayerKey] = useState(Date.now());
  const [videoSrc, setVideoSrc] = useState(null);


  const [selectedPreset, setSelectedPreset] = useState(presets[0].name);

  // UI states
  const [message, setMessage] = useState({ text: '', type: 'info' });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [outputUrl, setOutputUrl] = useState(null);


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
  const [selectionRect, setSelectionRect] = useState({ x: 0, y: 0, width: 100, height: 100 });


  // State for visual cropper interaction
  const [interaction, setInteraction] = useState({
    type: null, // 'drag', 'resize'
    handle: null, // e.g., 'body', 'se' (south-east)
    startX: 0,
    startY: 0,
    initialRect: null,
  });
  const visualCropContainerRef = useRef(null);

  const fileInputRef = useRef(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Chakra UI color mode values
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const dragActiveBg = useColorModeValue('blue.50', 'blue.900');
  const dropZoneHoverBorder = useColorModeValue('blue.400', 'blue.500');
  const mainBg = useColorModeValue('white', 'gray.800');
  const mainText = useColorModeValue('gray.800', 'whiteAlpha.900');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const dropZoneInitialBg = useColorModeValue('gray.50', 'gray.700');
  const selectedFileNameColor = useColorModeValue('blue.600', 'blue.300');
  const gifResultBoxBg = useColorModeValue('gray.50', 'gray.700');

  // Hoisted color mode values
  const progressBoxBgColor = useColorModeValue("gray.50", "gray.700");


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
    setFile(null);
    setVideoUrlInput('');
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
    setSelectedPreset(presets[0].name);
    setTextOverlay('');
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


  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]; // Use optional chaining
    if (!selectedFile) {
        resetStatesForNewVideo();
        setMessage({ text: 'No file selected.', type: 'info' });
        return;
    }

    const allowedTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/webm', 'video/x-matroska'];
    if (!allowedTypes.includes(selectedFile.type)) {
        resetStatesForNewVideo();
        setMessage({ text: 'Please select a valid video file (MP4, AVI, MOV, WEBM, MKV).', type: 'error' });
        return;
    }

    resetStatesForNewVideo();
    setFile(selectedFile);
    const localVideoUrl = URL.createObjectURL(selectedFile);
    setVideoSrc(localVideoUrl); // Show local preview immediately
    setVideoPlayerKey(Date.now()); // Ensure player updates for local preview

    const formData = new FormData();
    formData.append('video', selectedFile);

    setMessage({ text: `Uploading "${selectedFile.name}"...`, type: 'info' });
    setIsUploading(true);
    setUploadProgress(0);

    axios.post(`${apiUrl}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) { // Check if total is available to avoid division by zero
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
        }
      },
    })
    .then(response => {
      if (response.data && response.data.filename) {
          setUploadedFilename(response.data.filename);
          setMessage({ text: 'Video uploaded successfully. Ready to analyze.', type: 'success' });
          // Get initial duration and dimensions for local preview
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.src = localVideoUrl; // Use the same local blob for metadata
          video.onloadedmetadata = () => {
              setVideoDuration(video.duration);
              setTrim({ start: 0, end: video.duration });
              handleVideoMetadata({
                  width: video.videoWidth,
                  height: video.videoHeight,
                  naturalWidth: video.videoWidth,
                  naturalHeight: video.videoHeight
              });
              video.remove(); // Clean up the temporary video element
              // Optionally trigger auto-analysis after upload success
              // handleAnalyzeVideo(response.data.filename);
          };
          video.onerror = () => {
              console.error("Error loading video metadata from local file.");
              setMessage({ text: "Could not load video metadata from local file. Please try again.", type: 'error' });
              video.remove(); // Clean up the temporary video element
              // Decide if you want to reset or allow proceeding without metadata
              // For now, keep uploadedFilename so analyze button is enabled
          };
           // If metadata is already available (e.g., cached), trigger the handler immediately
          if (video.readyState >= 1) {
               video.onloadedmetadata(); // Manually trigger
          }
      } else {
          // Handle unexpected response structure
          console.error("Upload response missing filename:", response.data);
          setMessage({ text: 'Upload failed: Unexpected server response.', type: 'error' });
          resetStatesForNewVideo(); // Reset on unexpected response
      }
    })
    .catch(error => {
      console.error("Error uploading file:", error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown upload error.';
      setMessage({ text: `Upload failed: ${errorMessage}`, type: 'error' });
      resetStatesForNewVideo(); // Reset on upload failure
    })
    .finally(() => {
      setIsUploading(false);
      setUploadProgress(0); // Reset progress bar
    });
    setVideoUrlInput(''); // Clear URL input when file is selected
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
    const droppedFile = e.dataTransfer.files?.[0]; // Use optional chaining
    if (droppedFile) {
        const mockEvent = { target: { files: [droppedFile] } };
        handleFileChange(mockEvent);
    } else {
      setMessage({ text: 'Could not drop a valid video file.', type: 'error' });
    }
  };

  const handleProcessUrl = () => {
    if (!videoUrlInput.trim()) {
      setMessage({ text: 'Please enter a video URL.', type: 'error' });
      return;
    }
    resetStatesForNewVideo(); // Reset all states for a new video
    setMessage({ text: 'Processing URL...', type: 'info' });
    setIsAnalyzing(true); // Use isAnalyzing for URL processing as it leads to analysis

    axios.post(`${apiUrl}/process-url`, { url: videoUrlInput })
      .then(response => {
        if (response.data && response.data.filename) {
            setUploadedFilename(response.data.filename);
            setMessage({ text: `Video from URL processed. Ready to analyze.`, type: 'success' });
            // Trigger analysis after successful URL processing
            handleAnalyzeVideo(response.data.filename);
        } else {
             console.error("Process URL response missing filename:", response.data);
             setMessage({ text: 'URL processing failed: Unexpected server response.', type: 'error' });
             resetStatesForNewVideo(); // Reset on unexpected response
        }
      })
      .catch(error => {
        console.error("Error processing URL:", error);
        const errorMessage = error.response?.data?.error || error.message || 'Unknown URL processing error.';
        setMessage({ text: `URL processing failed: ${errorMessage}`, type: 'error' });
        setIsAnalyzing(false);
        resetStatesForNewVideo(); // Reset on URL processing failure
      });
  };

  const handleAnalyzeVideo = async (filenameToAnalyze = uploadedFilename) => {
    if (!filenameToAnalyze) {
      setMessage({ text: 'No video available to analyze.', type: 'error' });
      return;
    }
     if (isProcessing) { // Prevent multiple analysis clicks
         console.log("Analysis already in progress or busy.");
         return;
     }

    setMessage({ text: 'Analyzing video...', type: 'info' });
    setIsAnalyzing(true);
    setOutputUrl(null); // Clear previous output

    try {
      const analyzeResponse = await axios.post(`${apiUrl}/analyze`, { filename: filenameToAnalyze });
      if (analyzeResponse.data) {
            setVideoDuration(analyzeResponse.data.duration || 0); // Default to 0 if duration is missing
            setScenePoints(analyzeResponse.data.scenes || []); // Default to empty array
            setTrim({ start: 0, end: analyzeResponse.data.duration || 0 }); // Use default 0 if duration missing

            const backendPreviewUrl = analyzeResponse.data.preview_url;
            if (backendPreviewUrl) {
              setVideoSrc(backendPreviewUrl);
            } else if (videoSrc && videoSrc.startsWith('blob:')) {
               // Keep local preview if no backend preview is provided
               // No need to set videoSrc if it's already the correct local blob
            } else {
              setVideoSrc(null); // No preview available from backend or locally
            }

            // Update video dimensions after analysis if backend provides them or rely on the current videoSrc
            const currentPreviewSrc = backendPreviewUrl || videoSrc;
            if (currentPreviewSrc) {
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.src = currentPreviewSrc;
                 video.onloadedmetadata = () => {
                     handleVideoMetadata({
                         width: video.videoWidth,
                         height: video.videoHeight,
                         naturalWidth: video.videoWidth,
                         naturalHeight: video.videoHeight
                     });
                      video.remove(); // Clean up
                 };
                 video.onerror = () => {
                      console.error("Error loading video metadata after analysis for preview.");
                       // Proceed with analysis results but inform user about preview issue
                      setMessage({ text: "Analysis complete, but could not load video preview.", type: 'warning' });
                       video.remove(); // Clean up
                 };
                  // If metadata is already available
                 if (video.readyState >= 1) {
                     video.onloadedmetadata(); // Manually trigger
                 }
            } else {
                 // No video source to load metadata from
                handleVideoMetadata({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
            }

            setMessage({ text: `Video analyzed successfully. Duration: ${analyzeResponse.data.duration?.toFixed(1) || 'N/A'}s. Ready to convert.`, type: 'success' });
      } else {
           console.error("Analysis response is empty or invalid:", analyzeResponse.data);
           setMessage({ text: 'Analysis failed: Unexpected server response.', type: 'error' });
           resetStatesForNewVideo(); // Reset on invalid analysis response
      }
    } catch (error) {
      console.error("Error analyzing video:", error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown analysis error.';
      setMessage({ text: `Analysis failed: ${errorMessage}`, type: 'error' });
      resetStatesForNewVideo(); // Reset on analysis failure
    } finally {
      setVideoPlayerKey(Date.now()); // Force video player re-render
      setIsAnalyzing(false);
    }
  };


  const handleConvert = async () => {
    if (!uploadedFilename) {
      setMessage({ text: 'Please upload or process a video first.', type: 'error' });
      return;
    }
    if (videoDuration <= 0) {
         setMessage({ text: 'Video duration is required for conversion. Please try analyzing again.', type: 'error' });
         return;
    }
     if (isProcessing) {
         console.log("Conversion already in progress or busy.");
         return;
     }

    setMessage({ text: 'Starting conversion...', type: 'info' });
    setOutputUrl(null);
    setIsConverting(true);

    const finalOutputFormat = includeAudio ? 'mp4' : 'gif';
    setOutputFormat(finalOutputFormat);

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
      include_audio: finalOutputFormat === 'mp4',
      output_format: finalOutputFormat,
      crop_x: cropX,
      crop_y: cropY,
      crop_w: cropW,
      crop_h: cropH,
    };

    try {
      const response = await axios.post(`${apiUrl}/convert`, conversionSettings, {
          // Optional: Add timeout for conversion
          // timeout: 600000 // e.g., 10 minutes
      });
      if (response.data && response.data.url) {
          setMessage({ text: `Successfully converted to ${finalOutputFormat.toUpperCase()}!`, type: 'success' });
          setOutputUrl(response.data.url);
          setVideoPlayerKey(Date.now()); // Re-key to update player with new output
      } else {
           console.error("Convert response missing URL:", response.data);
           setMessage({ text: `Conversion failed: Unexpected server response.`, type: 'error' });
           setOutputUrl(null); // Clear output URL on failure
      }
    } catch (error) {
      console.error("Error converting video:", error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown conversion error.';
       // Check for specific FFmpeg errors or timeouts if your backend provides them
      if (errorMessage.includes('ffmpeg') || error.code === 'ECONNABORTED') {
           setMessage({ text: `Conversion failed (Processing Error): ${errorMessage}. Try adjusting settings like duration, resolution, or effects.`, type: 'error' });
      } else {
           setMessage({ text: `Conversion failed: ${errorMessage}`, type: 'error' });
      }
      setOutputUrl(null); // Clear output URL on failure
    } finally {
      setIsConverting(false);
    }
  };

  const handleTrimChange = useCallback(({ start, end }) => {
    setTrim({ start, end });
  }, [setTrim]); // setTrim is stable, so this callback is stable


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
        // Clamp position to prevent exceeding bounds based on the *current* size
        validatedRect.x = Math.max(0, Math.min(validatedRect.x, validatedRect.selectionNaturalWidth - validatedRect.width));
        validatedRect.y = Math.max(0, Math.min(validatedRect.y, validatedRect.selectionNaturalHeight - validatedRect.height));

         // Recalculate size based on clamped position to ensure it doesn't go beyond bounds
        validatedRect.width = Math.min(validatedRect.width, validatedRect.selectionNaturalWidth - validatedRect.x);
        validatedRect.height = Math.min(validatedRect.height, validatedRect.selectionNaturalHeight - validatedRect.y);
    }

    // Update states. These are stable setters and don't need to be in useCallback dependencies.
    setCropX(validatedRect.x === 0 && validatedRect.width === validatedRect.selectionNaturalWidth ? null : validatedRect.x); // Set to null if full width from x=0
    setCropY(validatedRect.y === 0 && validatedRect.height === validatedRect.selectionNaturalHeight ? null : validatedRect.y); // Set to null if full height from y=0
    setCropW(validatedRect.width === validatedRect.selectionNaturalWidth && validatedRect.x === 0 ? null : validatedRect.width); // Set to null if full width
    setCropH(validatedRect.height === validatedRect.selectionNaturalHeight && validatedRect.y === 0 ? null : validatedRect.height); // Set to null if full height

    // selectionRect is local state managed by this hook, updating it here is fine
    setSelectionRect(validatedRect);

  }, []); // Dependency array is empty as state setters and local state (selectionRect) are stable

  const handleVideoMetadata = useCallback(({ width, height, naturalWidth, naturalHeight }) => {
    setVideoPreviewDimensions({ width: width || 0, height: height || 0, naturalWidth: naturalWidth || 0, naturalHeight: naturalHeight || 0 });

    // Initialize or reset crop selection based on new video dimensions
    if (naturalWidth > 0 && naturalHeight > 0) {
        // Initialize to full video size if no crop was previously set
        const initialX = cropX !== null ? cropX : 0;
        const initialY = cropY !== null ? cropY : 0;
        const initialWidth = cropW !== null ? cropW : naturalWidth;
        const initialHeight = cropH !== null ? cropH : naturalHeight;

         // Ensure initial selection is within new bounds
         const validatedInitialRect = {
             x: Math.max(0, Math.min(initialX, naturalWidth - (initialWidth > 0 ? initialWidth : naturalWidth))),
             y: Math.max(0, Math.min(initialY, naturalHeight - (initialHeight > 0 ? initialHeight : naturalHeight))),
             width: Math.min(initialWidth > 0 ? initialWidth : naturalWidth, naturalWidth - Math.max(0, initialX)),
             height: Math.min(initialHeight > 0 ? initialHeight : naturalHeight, naturalHeight - Math.max(0, initialY)),
             selectionNaturalWidth: naturalWidth,
             selectionNaturalHeight: naturalHeight,
         };
        handleVisualCropChange(validatedInitialRect);
    } else {
         // Reset crop and selection if dimensions are invalid
        handleVisualCropChange({
            x: 0, y: 0, width: 0, height: 0,
            selectionNaturalWidth: 0, selectionNaturalHeight: 0
        });
         setCropX(null); setCropY(null); setCropW(null); setCropH(null); // Explicitly set crop to null
    }
  }, [cropX, cropY, cropW, cropH, handleVisualCropChange]); // Added crop dependencies


  useEffect(() => {
    // This useEffect syncs the numerical crop inputs with the visual selectionRect
    // when the visual cropper is hidden, or when video source/dimensions change.
    // It also initializes the visual selectionRect when the visual cropper is shown.

    // Initialize or update selectionRect when showing the cropper or dimensions change
    if (showVisualCropper && videoPreviewDimensions.naturalWidth > 0 && videoPreviewDimensions.naturalHeight > 0) {
        let calculatedInitialX, calculatedInitialY, calculatedInitialWidth, calculatedInitialHeight;

        // Determine if the current numerical crop settings represent a full frame or no crop
        const isXUnsetOrZero = cropX === null || cropX === 0;
        const isYUnsetOrZero = cropY === null || cropY === 0;
        const isWUnsetOrFull = cropW === null || cropW === videoPreviewDimensions.naturalWidth;
        const isHUnsetOrFull = cropH === null || cropH === videoPreviewDimensions.naturalHeight;
        const isEffectivelyUncropped = isXUnsetOrZero && isYUnsetOrZero && isWUnsetOrFull && isHUnsetOrFull;

        if (isEffectivelyUncropped) {
            // Default to a smaller, centered rectangle (e.g., 75% of video dimensions)
            calculatedInitialWidth = videoPreviewDimensions.naturalWidth * 0.75;
            calculatedInitialHeight = videoPreviewDimensions.naturalHeight * 0.75;
            calculatedInitialX = (videoPreviewDimensions.naturalWidth - calculatedInitialWidth) / 2;
            calculatedInitialY = (videoPreviewDimensions.naturalHeight - calculatedInitialHeight) / 2;
        } else {
            // User has specific numerical crop settings, use them
            calculatedInitialX = cropX !== null ? cropX : 0;
            calculatedInitialY = cropY !== null ? cropY : 0;
            calculatedInitialWidth = cropW !== null ? cropW : videoPreviewDimensions.naturalWidth;
            calculatedInitialHeight = cropH !== null ? cropH : videoPreviewDimensions.naturalHeight;
        }

         const initialRect = {
            x: calculatedInitialX, y: calculatedInitialY, width: calculatedInitialWidth, height: calculatedInitialHeight,
            selectionNaturalWidth: videoPreviewDimensions.naturalWidth,
            selectionNaturalHeight: videoPreviewDimensions.naturalHeight,
         };

         // Validate and clamp the initial selection rect to be within bounds
         const validatedInitialRect = {
             x: Math.max(0, Math.min(initialRect.x, initialRect.selectionNaturalWidth - (initialRect.width > 0 ? initialRect.width : initialRect.selectionNaturalWidth))),
             y: Math.max(0, Math.min(initialRect.y, initialRect.selectionNaturalHeight - (initialRect.height > 0 ? initialRect.height : initialRect.selectionNaturalHeight))),
             width: Math.min(initialRect.width > 0 ? initialRect.width : initialRect.selectionNaturalWidth, initialRect.selectionNaturalWidth - Math.max(0, initialRect.x)),
             height: Math.min(initialRect.height > 0 ? initialRect.height : initialRect.selectionNaturalHeight, initialRect.selectionNaturalHeight - Math.max(0, initialRect.y)),
              selectionNaturalWidth: initialRect.selectionNaturalWidth,
              selectionNaturalHeight: initialRect.selectionNaturalHeight,
         };
         validatedInitialRect.width = Math.max(10, validatedInitialRect.width); // Ensure min dimension
         validatedInitialRect.height = Math.max(10, validatedInitialRect.height); // Ensure min dimension


        // Only update selectionRect if its content has actually changed
        if (
            validatedInitialRect.x !== selectionRect.x ||
            validatedInitialRect.y !== selectionRect.y ||
            validatedInitialRect.width !== selectionRect.width ||
            validatedInitialRect.height !== selectionRect.height ||
            validatedInitialRect.selectionNaturalWidth !== selectionRect.selectionNaturalWidth ||
            validatedInitialRect.selectionNaturalHeight !== selectionRect.selectionNaturalHeight
        ) {
            setSelectionRect(validatedInitialRect);
        }
    } else if (!showVisualCropper && videoPreviewDimensions.naturalWidth > 0 && videoPreviewDimensions.naturalHeight > 0) {
        // When hiding the visual cropper, update cropX,Y,W,H based on the final selectionRect
        // Add a small delay to ensure the last mouseup event has processed its state update
        const updateCrop = setTimeout(() => {
            const newCropX = selectionRect.x === 0 && selectionRect.width === selectionRect.selectionNaturalWidth ? null : selectionRect.x;
            const newCropY = selectionRect.y === 0 && selectionRect.height === selectionRect.selectionNaturalHeight ? null : selectionRect.y;
            const newCropW = selectionRect.width === selectionRect.selectionNaturalWidth && selectionRect.x === 0 ? null : selectionRect.width;
            const newCropH = selectionRect.height === selectionRect.selectionNaturalHeight && selectionRect.y === 0 ? null : selectionRect.height;

            if (newCropX !== cropX || newCropY !== cropY || newCropW !== cropW || newCropH !== cropH) {
                setCropX(newCropX);
                setCropY(newCropY);
                setCropW(newCropW);
                setCropH(newCropH);
            }
        }, 50); // Added a small delay

        return () => clearTimeout(updateCrop); // Cleanup the timer

    } else if (!videoSrc) {
        // Reset crop and selection when no video source, only if they are not already reset
        if (cropX !== null || cropY !== null || cropW !== null || cropH !== null) {
            setCropX(null); setCropY(null); setCropW(null); setCropH(null);
        }
        if (selectionRect.x !== 0 || selectionRect.y !== 0 ||
            selectionRect.width !== 0 || selectionRect.height !== 0 ||
            selectionRect.selectionNaturalWidth !== 0 || selectionRect.selectionNaturalHeight !== 0) {
            setSelectionRect({ x: 0, y: 0, width: 0, height: 0, selectionNaturalWidth: 0, selectionNaturalHeight: 0 });
        }
    }
     // Depend on showVisualCropper, videoPreviewDimensions, crop states, selectionRect, videoSrc
     // Dependencies adjusted to include crop states for proper initialization when showing cropper
  }, [showVisualCropper, videoPreviewDimensions, cropX, cropY, cropW, cropH, selectionRect, videoSrc]);


  useEffect(() => {
    // This useEffect handles the actual mouse move and mouse up events for visual cropping
    if (!interaction.type || !visualCropContainerRef.current) return;

    const containerElement = visualCropContainerRef.current;
    const containerRect = containerElement.getBoundingClientRect();

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

      // Crucial check to prevent division by zero or incorrect scaling
      if (displayWidth <= 0 || displayHeight <= 0 || naturalWidth <= 0 || naturalHeight <= 0) {
          console.warn("Invalid dimensions for crop calculation during mouse move.");
          return;
      }

      const scaleX = naturalWidth / displayWidth;
      const scaleY = naturalHeight / displayHeight;

      const deltaXOriginal = (mouseXInContainer - startX) * scaleX;
      const deltaYOriginal = (mouseYInContainer - startY) * scaleY;

      let newRect = { ...initialRect };
      const minDim = 10;

      if (type === 'drag') {
        newRect.x = initialRect.x + deltaXOriginal;
        newRect.y = initialRect.y + deltaYOriginal;
      } else if (type === 'resize') {
        const { x: ix, y: iy, width: iw, height: ih } = initialRect;
        let potentialNewWidth = iw;
        let potentialNewHeight = ih;
        let potentialNewX = ix;
        let potentialNewY = iy;

        if (handle.includes('e')) {
          potentialNewWidth = iw + deltaXOriginal;
        }
        if (handle.includes('w')) {
          potentialNewWidth = iw - deltaXOriginal;
          potentialNewX = ix + (iw - potentialNewWidth);
        }
        if (handle.includes('s')) {
          potentialNewHeight = ih + deltaYOriginal;
        }
        if (handle.includes('n')) {
          potentialNewHeight = ih - deltaYOriginal;
           potentialNewY = iy + (ih - potentialNewHeight);
        }

         // Apply minimum dimension clamp (using potential values)
        newRect.width = Math.max(minDim, potentialNewWidth);
        newRect.height = Math.max(minDim, potentialNewHeight);
        newRect.x = potentialNewX;
        newRect.y = potentialNewY;

      }
       // After calculating the potential new rect, validate and clamp its position and size
      handleVisualCropChange(newRect);
    };

    const handleDocumentMouseUp = (e) => {
      e.preventDefault();
      // Final update on mouse up to ensure state is in sync
      if (interaction.type && interaction.initialRect) {
         handleVisualCropChange({ ...selectionRect }); // Use the latest selectionRect
      }
      setInteraction({ type: null, handle: null, startX: 0, startY: 0, initialRect: null });
    };

    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
    // Depend on interaction state (to attach/remove listeners), videoPreviewDimensions (for scaling),
    // and handleVisualCropChange (as it's called within the handler)
  }, [interaction, videoPreviewDimensions, handleVisualCropChange, selectionRect]); // Added selectionRect to deps


  const startInteraction = (e, type, handle = 'body') => {
    e.preventDefault();
    e.stopPropagation();
    if (!visualCropContainerRef.current || isProcessing) return;

    const containerRect = visualCropContainerRef.current.getBoundingClientRect();
    const startX = e.clientX - containerRect.left;
    const startY = e.clientY - containerRect.top;

     // Ensure we have valid dimensions before starting interaction
    if (videoPreviewDimensions.width <= 0 || videoPreviewDimensions.height <= 0 || selectionRect.selectionNaturalWidth <= 0 || selectionRect.selectionNaturalHeight <= 0) {
        console.warn("Cannot start crop interaction: Invalid video or selection dimensions.");
        return;
    }

    setInteraction({ type, handle, startX, startY, initialRect: { ...selectionRect } });
  };


  const fontStyleOptions = ["Arial", "Times New Roman", "Courier New", "Verdana", "Georgia", "Comic Sans MS"];

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
      setOutputFormat(preset.settings.includeAudio ? 'mp4' : 'gif');
      // Note: Trim, Crop, and Text Overlay are not typically part of presets, so they are not reset here.
    }
  };

  const isProcessing = isUploading || isAnalyzing || isConverting;

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
    <Box
      bg={mainBg}
      borderRadius="xl"
      boxShadow="lg"
      p={{ base: 4, md: 8 }}
      color={mainText}
      maxW="48rem"
      mx="auto"
      w="full"
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
      {progressIndicator}

      <FileUploadZone
        file={file}
        videoUrlInput={videoUrlInput}
        isDragging={isDragging}
        onFileChange={handleFileChange}
        onVideoUrlInputChange={(e) => {
          setVideoUrlInput(e.target.value);
          // Clear file input and related states when URL is entered
          if (e.target.value) {
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
             setUploadedFilename('');
             setVideoSrc(null);
             setVideoDuration(0);
             setTrim({ start: 0, end: 0 });
             setScenePoints([]);
             setVideoPreviewDimensions({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
             setCropX(null); setCropY(null); setCropW(null); setCropH(null);
             setShowVisualCropper(false);
             setOutputUrl(null);
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
          onClick={file ? () => handleAnalyzeVideo() : handleProcessUrl}
          isDisabled={(!file && !videoUrlInput) || isProcessing || (!file && videoUrlInput.trim() === '')}
          colorScheme="green"
          size="lg"
          w="full"
          isLoading={isProcessing && !outputUrl} // Show spinner during analysis or initial processing
          spinner={<Spinner size="md" />}
          leftIcon={isProcessing && !outputUrl ? undefined : <Icon as={FiUploadCloud} />}
        >
          {isProcessing && !outputUrl ? 'Processing...' : 'Process Video'}
        </Button>
      </VStack>

       {/* Video Preview Area */}
      {(videoSrc && !outputUrl && !showVisualCropper) && ( // Show standard player if videoSrc is available, no output, and cropper is hidden
        <VideoPlayer
          key={videoPlayerKey}
          src={videoSrc}
          onMetadataLoaded={handleVideoMetadata}
          liveTextOverlay={liveTextOverlayProps}
        />
      )}

      {/* Visual Cropper Area */}
      {showVisualCropper && videoSrc && videoPreviewDimensions.naturalWidth > 0 && !isProcessing && (
        <Box my={4} p={4} borderWidth="1px" borderRadius="lg" borderColor="blue.500" maxW="full" overflowX="auto">
            <Heading size="md" mb={2}>Visual Crop</Heading>
            {videoPreviewDimensions.naturalWidth > 0 && (
                <Text mb={2}>Video Dimensions: {videoPreviewDimensions.naturalWidth}x{videoPreviewDimensions.naturalHeight} (Original)</Text>
            )}
             {videoPreviewDimensions.width > 0 && videoPreviewDimensions.height > 0 && (
                <Text mb={4}>Displayed Preview Dimensions: {videoPreviewDimensions.width}x{videoPreviewDimensions.height}</Text>
             )}
             {(videoPreviewDimensions.width > 0 && videoPreviewDimensions.height > 0 && videoSrc) ? (
                <Box
                    position="relative"
                    width={`${videoPreviewDimensions.width}px`}
                    height={`${videoPreviewDimensions.height}px`}
                    mx="auto"
                    border="2px dashed gray"
                    ref={visualCropContainerRef}
                    overflow="hidden"
                    maxW="full"
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
                            display: (selectionRect.width <=0 || selectionRect.height <=0 || selectionRect.selectionNaturalWidth <= 0 || selectionRect.selectionNaturalHeight <= 0) ? 'none' : 'block', // Hide if invalid dimensions
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
          isProcessing={isProcessing}
          cropX={cropX} setCropX={setCropX}
          cropY={cropY} setCropY={setCropY}
          cropW={cropW} setCropW={setCropW}
          cropH={cropH} setCropH={setCropH}
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

      {/* Convert Button */}
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
            isDisabled={isProcessing || !uploadedFilename || videoDuration <= 0} // Disable if no video or duration
          >
            {isConverting ? 'Converting...' : `Convert to ${outputFormat.toUpperCase()}`}
          </Button>
        </>
      )}

      <OutputDisplay
        outputUrl={outputUrl}
        outputFormat={outputFormat}
        liveTextOverlay={null}
      />
    </Box>
  );
}

export default Upload;