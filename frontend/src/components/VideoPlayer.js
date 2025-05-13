import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Box, Heading, useColorModeValue } from '@chakra-ui/react';

function VideoPlayer({ src, onMetadataLoaded, liveTextOverlay }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const headingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const playerBg = useColorModeValue('black', 'gray.900'); // Background for the player
  const onMetadataLoadedRef = useRef(onMetadataLoaded);
  const overlayRef = useRef(null); // Ref for the text overlay element

  // Keep the ref updated with the latest callback
  useEffect(() => {
    onMetadataLoadedRef.current = onMetadataLoaded;
  }, [onMetadataLoaded]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    // It's crucial to dispose of the old player instance if one exists.
    // This will be called on unmount (due to parent key change) or if src changes directly.
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    if (src) {
      // Determine video type from src extension if possible
      let videoType = '';
      if (src.includes('.mp4')) videoType = 'video/mp4';
      else if (src.includes('.webm')) videoType = 'video/webm';
      else if (src.includes('.ogv') || src.includes('.ogg')) videoType = 'video/ogg';
      // Add more types as needed
      
      const options = {
        controls: true,
        responsive: true,
        fluid: true, // Makes player adapt to container size
        autoplay: false,
        sources: [{ src: src, type: videoType || 'video/mp4' }] // Default to mp4 if type unknown
      };

      const player = videojs(videoElement, options, () => {
        // console.log('Player is ready'); // Keep for debugging if needed
      });

      player.on('loadedmetadata', () => {
        // console.log('Video metadata loaded:', videoRef.current.videoWidth, videoRef.current.videoHeight);
        // Ensure videoRef.current is still valid as this is an async event
        if (onMetadataLoadedRef.current && videoRef.current) {
          onMetadataLoadedRef.current({
            width: videoRef.current.offsetWidth, // Actual displayed width of the video element
            height: videoRef.current.offsetHeight, // Actual displayed height
            naturalWidth: videoRef.current.videoWidth, // Intrinsic width of the video
            naturalHeight: videoRef.current.videoHeight // Intrinsic height of the video
          });
        }
      });
      
      playerRef.current = player;
    }

    // The return function from useEffect serves as the cleanup.
    // It will run when the component unmounts (e.g. parent key changes)
    // or before the effect runs again if `src` were in the dependency array and changed.
    return () => {
      if (playerRef.current && typeof playerRef.current.dispose === 'function' && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src]); // Effect dependencies: re-initialize if `src` changes.

  // Effect for managing the live text overlay
  useEffect(() => {
    const player = playerRef.current;

    // If player is not ready or disposed, or no text to display, remove existing overlay
    if (!player || player.isDisposed() || !liveTextOverlay || !liveTextOverlay.text) {
      if (overlayRef.current) {
        overlayRef.current.remove();
        overlayRef.current = null;
      }
      return;
    }

    // Create overlay element if it doesn't exist
    if (!overlayRef.current) {
      overlayRef.current = document.createElement('div');
      overlayRef.current.style.position = 'absolute';
      overlayRef.current.style.pointerEvents = 'none'; // Prevent interference with video controls
      overlayRef.current.style.zIndex = '10'; // Ensure it's above the video
      overlayRef.current.style.textAlign = 'center'; // Default text alignment
      player.el().appendChild(overlayRef.current); // Append to player's DOM element
    }

    const overlayEl = overlayRef.current;
    const { text, fontSize, position, color, bgColor, fontStyle } = liveTextOverlay;

    overlayEl.textContent = text;
    overlayEl.style.fontSize = `${fontSize || 24}px`;
    overlayEl.style.fontFamily = fontStyle || 'Arial, sans-serif';
    overlayEl.style.color = color || 'white';
    
    if (bgColor && bgColor.trim() !== '') {
      overlayEl.style.backgroundColor = bgColor;
      overlayEl.style.padding = '0.2em 0.4em';
      overlayEl.style.borderRadius = '3px';
    } else {
      overlayEl.style.backgroundColor = 'transparent';
      overlayEl.style.padding = '0';
      overlayEl.style.borderRadius = '0';
    }

    // Positioning logic
    overlayEl.style.top = 'auto';
    overlayEl.style.bottom = 'auto';
    overlayEl.style.left = '50%'; // Default to horizontal center
    overlayEl.style.right = 'auto';
    overlayEl.style.transform = 'translateX(-50%)'; // Adjust for horizontal centering

    const margin = '15px'; // Margin from edges

    if (position === 'top-left' || position === 'top-right') {
      overlayEl.style.top = margin;
    } else if (position === 'bottom-left' || position === 'bottom-right') {
      overlayEl.style.bottom = margin;
    } else { // center
      overlayEl.style.top = '50%';
      overlayEl.style.transform = 'translate(-50%, -50%)'; // Adjust for vertical centering too
    }

    if (position === 'top-left' || position === 'bottom-left') {
      overlayEl.style.left = margin;
      overlayEl.style.transform = position.includes('top') || position.includes('bottom') ? 'translateY(0)' : 'translate(-50%, -50%)'; // Reset transform if not purely centered
    } else if (position === 'top-right' || position === 'bottom-right') {
      overlayEl.style.left = 'auto'; // Unset left for right alignment
      overlayEl.style.right = margin;
      overlayEl.style.transform = position.includes('top') || position.includes('bottom') ? 'translateY(0)' : 'translate(-50%, -50%)';  // Reset transform if not purely centered
    }

  }, [liveTextOverlay, playerRef.current]); // Re-run if overlay settings or player instance changes

  return (
    <Box my={4} className="video-player-container">
      <Heading as="h4" size="sm" mb={2} color={headingColor}>
        Video Preview
      </Heading>
      <Box data-vjs-player bg={playerBg} borderRadius="md" overflow="hidden">
        {/* 
          The `key` prop on the <video> element ensures that if the `src` changes,
          React treats the <video> element itself as a new element, forcing a full re-initialization
          by the browser, which can be helpful for video.js.
        */}
        <video key={src} ref={videoRef} className="video-js vjs-big-play-centered vjs-fluid" />
      </Box>
    </Box>
  );
}

export default VideoPlayer;
