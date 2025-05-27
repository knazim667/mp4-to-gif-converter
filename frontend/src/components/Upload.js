// /Users/abbaskhan/Documents/mp4-to-gif-converter/frontend/src/components/Upload.js
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
  // Aspect Ratio State - LIFTED HERE
  const [selectedAspectRatioKey, setSelectedAspectRatioKey] = useState('custom'); 

  const [showVisualCropper, setShowVisualCropper] = useState(false);
  const [videoPreviewDimensions, setVideoPreviewDimensions] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const [selectionRect, setSelectionRect] = useState({ x: 0, y: 0, width: 100, height: 100, selectionNaturalWidth: 0, selectionNaturalHeight: 0 });


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
  const mainBg = useColorModeValue('white', 'gray.800');
  const mainText = useColorModeValue('gray.800', 'whiteAlpha.900');
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
    setSelectedAspectRatioKey('custom'); // Reset aspect ratio
    setSelectionRect({ x: 0, y: 0, width: 0, height: 0, selectionNaturalWidth: 0, selectionNaturalHeight: 0 });
    setVideoPreviewDimensions({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
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
          
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.src = localVideoUrl; 
          video.onloadedmetadata = () => {
              setVideoDuration(video.duration);
              setTrim({ start: 0, end: video.duration });
              handleVideoMetadata({
                  width: video.videoWidth, // Use videoWidth/Height for initial natural dimensions
                  height: video.videoHeight,
                  naturalWidth: video.videoWidth,
                  naturalHeight: video.videoHeight
              });
              video.remove(); 
          };
          video.onerror = () => {
              console.error("Error loading video metadata from local file.");
              setMessage({ text: "Could not load video metadata from local file. Please try again.", type: 'error' });
              video.remove(); 
          };
          if (video.readyState >= 1) {
               video.onloadedmetadata(); 
          }
      } else {
          console.error("Upload response missing filename:", response.data);
          setMessage({ text: 'Upload failed: Unexpected server response.', type: 'error' });
          resetStatesForNewVideo(); 
      }
    })
    .catch(error => {
      console.error("Error uploading file:", error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown upload error.';
      setMessage({ text: `Upload failed: ${errorMessage}`, type: 'error' });
      resetStatesForNewVideo(); 
    })
    .finally(() => {
      setIsUploading(false);
      setUploadProgress(0); 
    });
    setVideoUrlInput(''); 
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
    const droppedFile = e.dataTransfer.files?.[0]; 
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
    resetStatesForNewVideo(); 
    setMessage({ text: 'Processing URL...', type: 'info' });
    setIsAnalyzing(true); 

    axios.post(`${apiUrl}/process-url`, { url: videoUrlInput })
      .then(response => {
        if (response.data && response.data.filename) {
            setUploadedFilename(response.data.filename);
            setMessage({ text: `Video from URL processed. Ready to analyze.`, type: 'success' });
            handleAnalyzeVideo(response.data.filename);
        } else {
             console.error("Process URL response missing filename:", response.data);
             setMessage({ text: 'URL processing failed: Unexpected server response.', type: 'error' });
             resetStatesForNewVideo(); 
        }
      })
      .catch(error => {
        console.error("Error processing URL:", error);
        const errorMessage = error.response?.data?.error || error.message || 'Unknown URL processing error.';
        setMessage({ text: `URL processing failed: ${errorMessage}`, type: 'error' });
        setIsAnalyzing(false);
        resetStatesForNewVideo(); 
      });
  };

  const handleAnalyzeVideo = async (filenameToAnalyze = uploadedFilename) => {
    if (!filenameToAnalyze) {
      setMessage({ text: 'No video available to analyze.', type: 'error' });
      return;
    }
     if (isProcessing) { 
         console.log("Analysis already in progress or busy.");
         return;
     }

    setMessage({ text: 'Analyzing video...', type: 'info' });
    setIsAnalyzing(true);
    setOutputUrl(null); 

    try {
      const analyzeResponse = await axios.post(`${apiUrl}/analyze`, { filename: filenameToAnalyze });
      if (analyzeResponse.data) {
            setVideoDuration(analyzeResponse.data.duration || 0); 
            setScenePoints(analyzeResponse.data.scenes || []); 
            setTrim({ start: 0, end: analyzeResponse.data.duration || 0 }); 

            const backendPreviewUrl = analyzeResponse.data.preview_url;
            if (backendPreviewUrl) {
              setVideoSrc(backendPreviewUrl);
            } else if (videoSrc && videoSrc.startsWith('blob:')) {
              // Keep local blob if no backend preview
            } else {
              setVideoSrc(null); 
            }

            const currentPreviewSrc = backendPreviewUrl || videoSrc;
            if (currentPreviewSrc) {
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.src = currentPreviewSrc;
                 video.onloadedmetadata = () => {
                     handleVideoMetadata({ // This will set naturalWidth/Height correctly
                         width: video.videoWidth, // Pass natural dimensions for consistency
                         height: video.videoHeight,
                         naturalWidth: video.videoWidth,
                         naturalHeight: video.videoHeight
                     });
                      video.remove(); 
                 };
                 video.onerror = () => {
                      console.error("Error loading video metadata after analysis for preview.");
                      setMessage({ text: "Analysis complete, but could not load video preview.", type: 'warning' });
                       video.remove(); 
                 };
                 if (video.readyState >= 1) {
                     video.onloadedmetadata(); 
                 }
            } else {
                handleVideoMetadata({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
            }

            setMessage({ text: `Video analyzed successfully. Duration: ${analyzeResponse.data.duration?.toFixed(1) || 'N/A'}s. Ready to convert.`, type: 'success' });
      } else {
           console.error("Analysis response is empty or invalid:", analyzeResponse.data);
           setMessage({ text: 'Analysis failed: Unexpected server response.', type: 'error' });
           resetStatesForNewVideo(); 
      }
    } catch (error) {
      console.error("Error analyzing video:", error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown analysis error.';
      setMessage({ text: `Analysis failed: ${errorMessage}`, type: 'error' });
      resetStatesForNewVideo(); 
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
    
    console.log('[Upload.js handleConvert] Conversion Settings Payload:', conversionSettings);
    // Log the state values directly as well to be sure
    console.log('[Upload.js handleConvert] Current crop states:', { cropX, cropY, cropW, cropH });
    console.log('[Upload.js handleConvert] Selected Aspect Ratio Key:', selectedAspectRatioKey);


    try {
      const response = await axios.post(`${apiUrl}/convert`, conversionSettings, {
          // timeout: 600000 
      });
      if (response.data && response.data.url) {
          setMessage({ text: `Successfully converted to ${finalOutputFormat.toUpperCase()}!`, type: 'success' });
          setOutputUrl(response.data.url);
          setVideoPlayerKey(Date.now()); 
      } else {
           console.error("Convert response missing URL:", response.data);
           setMessage({ text: `Conversion failed: Unexpected server response.`, type: 'error' });
           setOutputUrl(null); 
      }
    } catch (error) {
      console.error("Error converting video:", error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown conversion error.';
      if (errorMessage.includes('ffmpeg') || error.code === 'ECONNABORTED') {
           setMessage({ text: `Conversion failed (Processing Error): ${errorMessage}. Try adjusting settings like duration, resolution, or effects.`, type: 'error' });
      } else {
           setMessage({ text: `Conversion failed: ${errorMessage}`, type: 'error' });
      }
      setOutputUrl(null); 
    } finally {
      setIsConverting(false);
    }
  };

  const handleTrimChange = useCallback(({ start, end }) => {
    setTrim({ start, end });
  }, []); 


  const handleVisualCropChange = useCallback((newRect) => {
    const minDimension = 10; // Minimum pixel dimension for crop width/height
    const naturalWidth = newRect.selectionNaturalWidth || 0;
    const naturalHeight = newRect.selectionNaturalHeight || 0;

    let validatedX = Math.round(newRect.x ?? 0);
    let validatedY = Math.round(newRect.y ?? 0);
    let validatedWidth = Math.round(newRect.width ?? minDimension);
    let validatedHeight = Math.round(newRect.height ?? minDimension);

    // Ensure minimum dimensions
    validatedWidth = Math.max(minDimension, validatedWidth);
    validatedHeight = Math.max(minDimension, validatedHeight);

    if (naturalWidth > 0 && naturalHeight > 0) {
        // Clamp width and height to not exceed natural dimensions
        validatedWidth = Math.min(validatedWidth, naturalWidth);
        validatedHeight = Math.min(validatedHeight, naturalHeight);

        // Clamp position to prevent exceeding bounds
        validatedX = Math.max(0, Math.min(validatedX, naturalWidth - validatedWidth));
        validatedY = Math.max(0, Math.min(validatedY, naturalHeight - validatedHeight));

        // Recalculate size based on clamped position if necessary (should already be handled by above)
        validatedWidth = Math.min(validatedWidth, naturalWidth - validatedX);
        validatedHeight = Math.min(validatedHeight, naturalHeight - validatedY);
    } else {
        // If natural dimensions are not available, reset to zero or default small values
        validatedX = 0;
        validatedY = 0;
        validatedWidth = minDimension;
        validatedHeight = minDimension;
    }
    
    const finalRect = {
        x: validatedX,
        y: validatedY,
        width: validatedWidth,
        height: validatedHeight,
        selectionNaturalWidth: naturalWidth,
        selectionNaturalHeight: naturalHeight,
    };

    setCropX(finalRect.x === 0 && finalRect.width === finalRect.selectionNaturalWidth ? null : finalRect.x);
    setCropY(finalRect.y === 0 && finalRect.height === finalRect.selectionNaturalHeight ? null : finalRect.y);
    setCropW(finalRect.width === finalRect.selectionNaturalWidth && finalRect.x === 0 ? null : finalRect.width);
    setCropH(finalRect.height === finalRect.selectionNaturalHeight && finalRect.y === 0 ? null : finalRect.height);

    setSelectionRect(finalRect);

  }, []); 

  const handleVideoMetadata = useCallback(({ width, height, naturalWidth, naturalHeight }) => {
    // `width` and `height` here are the video player's display dimensions.
    // `naturalWidth` and `naturalHeight` are the video's intrinsic dimensions.
    setVideoPreviewDimensions({ 
        width: width || 0, 
        height: height || 0, 
        naturalWidth: naturalWidth || 0, 
        naturalHeight: naturalHeight || 0 
    });

    if (naturalWidth > 0 && naturalHeight > 0) {
        const currentCropIsSet = cropX !== null || cropY !== null || cropW !== null || cropH !== null;
        
        const initialX = currentCropIsSet && cropX !== null ? cropX : 0;
        const initialY = currentCropIsSet && cropY !== null ? cropY : 0;
        const initialWidth = currentCropIsSet && cropW !== null ? cropW : naturalWidth;
        const initialHeight = currentCropIsSet && cropH !== null ? cropH : naturalHeight;

         handleVisualCropChange({
             x: initialX,
             y: initialY,
             width: initialWidth,
             height: initialHeight,
             selectionNaturalWidth: naturalWidth,
             selectionNaturalHeight: naturalHeight,
         });
    } else {
        handleVisualCropChange({
            x: 0, y: 0, width: 0, height: 0,
            selectionNaturalWidth: 0, selectionNaturalHeight: 0
        });
         setCropX(null); setCropY(null); setCropW(null); setCropH(null);
    }
  }, [cropX, cropY, cropW, cropH, handleVisualCropChange]); 


  useEffect(() => {
    if (showVisualCropper && videoPreviewDimensions.naturalWidth > 0 && videoPreviewDimensions.naturalHeight > 0) {
        let initialX, initialY, initialWidth, initialHeight;
        const natW = videoPreviewDimensions.naturalWidth;
        const natH = videoPreviewDimensions.naturalHeight;

        const isXUnsetOrZero = cropX === null || cropX === 0;
        const isYUnsetOrZero = cropY === null || cropY === 0;
        const isWUnsetOrFull = cropW === null || cropW === natW; 
        const isHUnsetOrFull = cropH === null || cropH === natH;
        // If an aspect ratio is selected (not custom) OR specific crop values exist, use them.
        // Otherwise, if it's effectively uncropped AND aspect ratio is custom, then default to 75%.
        const useDefaultVisualCrop = (isXUnsetOrZero && isYUnsetOrZero && isWUnsetOrFull && isHUnsetOrFull) && selectedAspectRatioKey === 'custom';

        if (useDefaultVisualCrop) {
            initialWidth = natW * 0.75;
            initialHeight = natH * 0.75;
            initialX = (natW - initialWidth) / 2; 
            initialY = (natH - initialHeight) / 2;
        } else {
            // If an aspect ratio is selected, or crop values exist, use them.
            // This ensures that if CropSettings.js calculated values based on AR, they are respected here.
            initialX = cropX !== null ? cropX : 0;
            initialY = cropY !== null ? cropY : 0;
            initialWidth = cropW !== null ? cropW : natW;
            initialHeight = cropH !== null ? cropH : natH;
        }
        console.log('[Upload.js useEffect - showVisualCropper] Initializing visual cropper. Use default:', useDefaultVisualCrop, 'Initial values:', { initialX, initialY, initialWidth, initialHeight, natW, natH, selectedAspectRatioKey });
        handleVisualCropChange({ // This updates selectionRect AND cropX,Y,W,H
            x: initialX, y: initialY, width: initialWidth, height: initialHeight,
            selectionNaturalWidth: natW,
            selectionNaturalHeight: natH,
        });

    } else if (!showVisualCropper && videoPreviewDimensions.naturalWidth > 0 && videoPreviewDimensions.naturalHeight > 0) {
        // When numerical inputs are active (visual cropper is hidden)
        // Ensure selectionRect stays in sync with cropX, cropY, cropW, cropH
        // These cropX,Y,W,H are being set by CropSettings.js
        const natW = videoPreviewDimensions.naturalWidth;
        const natH = videoPreviewDimensions.naturalHeight;
        const currentRectX = cropX !== null ? cropX : 0;
        const currentRectY = cropY !== null ? cropY : 0;
        // If cropW/H are null, it means full width/height relative to X/Y.
        // For selectionRect, we need concrete values.
        const currentRectW = cropW !== null ? cropW : (natW - currentRectX); // Ensure this calculation is correct for "full"
        const currentRectH = cropH !== null ? cropH : (natH - currentRectY); // Ensure this calculation is correct for "full"

        if (
            selectionRect.x !== currentRectX ||
            selectionRect.y !== currentRectY ||
            selectionRect.width !== currentRectW ||
            selectionRect.height !== currentRectH ||
            selectionRect.selectionNaturalWidth !== natW ||
            selectionRect.selectionNaturalHeight !== natH
        ) {
            console.log('[Upload.js useEffect - !showVisualCropper] Syncing selectionRect from crop props:', { currentRectX, currentRectY, currentRectW, currentRectH, natW, natH });
            setSelectionRect({
                x: currentRectX,
                y: currentRectY,
                width: currentRectW,
                height: currentRectH,
                selectionNaturalWidth: natW,
                selectionNaturalHeight: natH,
            });
        }
    } else if (!videoSrc) {
        if (cropX !== null || cropY !== null || cropW !== null || cropH !== null) {
            setCropX(null); setCropY(null); setCropW(null); setCropH(null);
        }
        if (selectionRect.x !== 0 || selectionRect.y !== 0 ||
            selectionRect.width !== 0 || selectionRect.height !== 0 ||
            selectionRect.selectionNaturalWidth !== 0 || selectionRect.selectionNaturalHeight !== 0) {
            setSelectionRect({ x: 0, y: 0, width: 0, height: 0, selectionNaturalWidth: 0, selectionNaturalHeight: 0 });
        }
        if (selectedAspectRatioKey !== 'custom') { // Also reset aspect ratio if video is removed
            setSelectedAspectRatioKey('custom');
        }
        // console.log('[Upload.js useEffect - !videoSrc] Resetting crop states and aspect ratio.'); // Keep for debugging if needed
    } else {
        // console.log('[Upload.js useEffect] General state check:', { showVisualCropper, natW, natH, cropX, cropY, cropW, cropH, selectedAspectRatioKey, videoSrcExists: !!videoSrc });

    }
  // Original deps: [showVisualCropper, videoPreviewDimensions, cropX, cropY, cropW, cropH, videoSrc, handleVisualCropChange]
  // Adding selectedAspectRatioKey because the logic for initializing visual cropper might depend on it.
  }, [showVisualCropper, videoPreviewDimensions, cropX, cropY, cropW, cropH, videoSrc, handleVisualCropChange, selectedAspectRatioKey]);
// `selectionRect` was removed from deps to prevent loops, as it's set inside.


  // Log changes to critical crop states
  useEffect(() => {
    console.log('[Upload.js] Crop state changed: ', { cropX, cropY, cropW, cropH });
  }, [cropX, cropY, cropW, cropH]);

  useEffect(() => {
    console.log('[Upload.js] selectedAspectRatioKey changed: ', selectedAspectRatioKey);
  }, [selectedAspectRatioKey]);

  // Helper to get coordinates from mouse or touch events
  const getEventCoordinates = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  };

  useEffect(() => {
    if (!interaction.type || !visualCropContainerRef.current) return;

    const containerElement = visualCropContainerRef.current;
    const containerRect = containerElement.getBoundingClientRect();

    const handleDocumentMove = (e) => {
      if (e.type === 'touchmove' && e.cancelable) {
        e.preventDefault();
      }

      const coords = getEventCoordinates(e);
      if (coords.clientX === undefined || coords.clientY === undefined) return;

      const currentXInContainer = coords.clientX - containerRect.left;
      const currentYInContainer = coords.clientY - containerRect.top;
      const { initialRect, startX, startY, type, handle } = interaction;
      if (!initialRect) return;

      const displayWidth = videoPreviewDimensions.width;
      const displayHeight = videoPreviewDimensions.height;
      const naturalWidth = initialRect.selectionNaturalWidth;
      const naturalHeight = initialRect.selectionNaturalHeight;

      if (displayWidth <= 0 || displayHeight <= 0 || naturalWidth <= 0 || naturalHeight <= 0) {
          console.warn("Invalid dimensions for crop calculation during move.");
          return;
      }

      const scaleX = naturalWidth / displayWidth;
      const scaleY = naturalHeight / displayHeight;

      const deltaXOriginal = (currentXInContainer - startX) * scaleX;
      const deltaYOriginal = (currentYInContainer - startY) * scaleY;

      let newRect = { ...initialRect };
      const minDim = 10;

      if (type === 'drag') {
        newRect.x = initialRect.x + deltaXOriginal;
        newRect.y = initialRect.y + deltaYOriginal;
      } else if (type === 'resize') {
        const { x: ix, y: iy, width: iw, height: ih } = initialRect;
        let newX = ix;
        let newY = iy;
        let newW = iw;
        let newH = ih;

        if (handle.includes('e')) newW = iw + deltaXOriginal;
        if (handle.includes('w')) {
          newW = iw - deltaXOriginal;
          newX = ix + deltaXOriginal;
        }
        if (handle.includes('s')) newH = ih + deltaYOriginal;
        if (handle.includes('n')) {
          newH = ih - deltaYOriginal;
          newY = iy + deltaYOriginal;
        }

        if (newW < minDim) {
          if (handle.includes('w')) newX = ix + iw - minDim;
          newW = minDim;
        }
        if (newH < minDim) {
          if (handle.includes('n')) newY = iy + ih - minDim;
          newH = minDim;
        }
        
        newRect.x = newX;
        newRect.y = newY;
        newRect.width = newW;
        newRect.height = newH;
      }
      handleVisualCropChange(newRect);
    };

    const handleDocumentEnd = () => {
      if (interaction.type && interaction.initialRect) {
         handleVisualCropChange({ ...selectionRect }); 
      }
      setInteraction({ type: null, handle: null, startX: 0, startY: 0, initialRect: null });
    };

    document.addEventListener('mousemove', handleDocumentMove);
    document.addEventListener('touchmove', handleDocumentMove, { passive: false });
    document.addEventListener('mouseup', handleDocumentEnd);
    document.addEventListener('touchend', handleDocumentEnd);
    document.addEventListener('touchcancel', handleDocumentEnd);

    return () => {
      document.removeEventListener('mousemove', handleDocumentMove);
      document.removeEventListener('touchmove', handleDocumentMove);
      document.removeEventListener('mouseup', handleDocumentEnd);
      document.removeEventListener('touchend', handleDocumentEnd);
      document.removeEventListener('touchcancel', handleDocumentEnd);
    };
  }, [interaction, videoPreviewDimensions, handleVisualCropChange, selectionRect]);


  const startInteraction = (e, type, handle = 'body') => {
    if (e.cancelable) e.preventDefault();
    e.stopPropagation();
    if (!visualCropContainerRef.current || isProcessing) return;

    const coords = getEventCoordinates(e);
    if (coords.clientX === undefined || coords.clientY === undefined) {
        console.warn("Undefined coordinates in startInteraction");
        return;
    }
    const containerRect = visualCropContainerRef.current.getBoundingClientRect();
    const startX = coords.clientX - containerRect.left;
    const startY = coords.clientY - containerRect.top;

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
        Video to GIF &amp; MP4 Converter
      </Heading>
      {message.text && (
        <Alert status={message.type} borderRadius="md" mb={6} variant="subtle">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle mr={2} fontWeight="semibold">
              {message.type === 'success' ? 'Success!' : message.type === 'error' ? 'Error!' : message.type === 'warning' ? 'Warning' : 'Info'}
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
          if (e.target.value) {
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
             resetStatesForNewVideo(); // Reset all relevant states
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
          isDisabled={(!file && !videoUrlInput.trim()) || isProcessing}
          colorScheme="blue" // Changed for better consistency with other primary actions
          size="lg"
          w="full"
          isLoading={isAnalyzing || (isUploading && !uploadedFilename)} 
          spinner={<Spinner size="md" />}
          leftIcon={(isAnalyzing || (isUploading && !uploadedFilename)) ? undefined : <Icon as={FiUploadCloud} />}
        >
          {(isAnalyzing || (isUploading && !uploadedFilename)) ? 'Processing...' : 'Process Video'}
        </Button>
      </VStack>

      {(videoSrc && !outputUrl && !showVisualCropper) && (
        <VideoPlayer
          key={videoPlayerKey}
          src={videoSrc}
          onMetadataLoaded={handleVideoMetadata}
          liveTextOverlay={liveTextOverlayProps}
        />
      )}

      {showVisualCropper && videoSrc && videoPreviewDimensions.naturalWidth > 0 && !isProcessing && (
        <Box my={{ base: 3, md: 4 }} p={{ base: 2, md: 4 }} borderWidth="1px" borderRadius="lg" borderColor="blue.500" maxW="full" overflowX="auto">
            <Heading size={{ base: 'sm', md: 'md' }} mb={2}>Visual Crop</Heading>
            {videoPreviewDimensions.naturalWidth > 0 && (
                <Text mb={2} fontSize="sm">Original Video: {videoPreviewDimensions.naturalWidth}x{videoPreviewDimensions.naturalHeight}px</Text>
            )}
             {videoPreviewDimensions.width > 0 && videoPreviewDimensions.height > 0 && (
                <Text mb={{ base: 2, md: 4 }} fontSize="sm">Preview Display: {videoPreviewDimensions.width}x{videoPreviewDimensions.height}px</Text>
             )}
             {(videoPreviewDimensions.width > 0 && videoPreviewDimensions.height > 0 && videoSrc) ? (
                <Box
                    position="relative"
                    width={`${videoPreviewDimensions.width}px`}
                    height={`${videoPreviewDimensions.height}px`}
                    mx="auto"
                    border="1px dashed gray"
                    ref={visualCropContainerRef}
                    overflow="hidden" // Important for containing the video and selection
                    maxW="full" // Ensure it doesn't overflow its parent
                    userSelect="none" // Prevent text selection during drag
                >
                    <video
                        src={videoSrc}
                        style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }}
                        controls={false} // No controls for the crop preview
                        autoPlay={false}
                        muted
                        draggable="false" // Prevent native drag
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
                            display: (selectionRect.width <=0 || selectionRect.height <=0 || selectionRect.selectionNaturalWidth <= 0 || selectionRect.selectionNaturalHeight <= 0) ? 'none' : 'block',
                        }}
                        onMouseDown={(e) => startInteraction(e, 'drag')}
                        onTouchStart={(e) => startInteraction(e, 'drag')}
                        draggable="false"
                    >
                        {['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'].map(handleName => {
                            const handleSize = "12px";
                            const handleOffset = "-6px"; // Half of handleSize to center it on the border
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
                                    onTouchStart={(e) => startInteraction(e, 'resize', handleName)}
                                    draggable="false"
                                />
                            );
                        })}
                    </Box>
                </Box>
             ) : (
                 <Text color="gray.500" textAlign="center">Video preview not available for visual cropping.</Text>
             )}
            <Text mt={{ base: 1, md: 2 }} fontSize="xs">Current Crop (Original Dims): X={cropX !== null ? cropX : 'Full'}, Y={cropY !== null ? cropY : 'Full'}, W={cropW !== null ? cropW : 'Full'}, H={cropH !== null ? cropH : 'Full'}</Text>
        </Box>
      )}


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
          selectedAspectRatioKey={selectedAspectRatioKey} // Pass down
          setSelectedAspectRatioKey={setSelectedAspectRatioKey} // Pass down
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

      {uploadedFilename && videoDuration > 0 && (
        <>
          <Divider my={{ base: 6, md: 10 }} />
          <Button
            onClick={handleConvert}
            colorScheme="purple"
            size="lg"
            w="full"
            isLoading={isConverting}
            spinner={<Spinner size="md" />}
            leftIcon={isConverting ? undefined : <Icon as={FiUploadCloud} transform="rotate(90deg)" />}
            isDisabled={isProcessing || !uploadedFilename || videoDuration <= 0}
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
