import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Box, Heading, useColorModeValue } from '@chakra-ui/react';

function VideoPlayer({ src, onMetadataLoaded }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const headingColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  const playerBg = useColorModeValue('black', 'gray.900'); // Background for the player
  const onMetadataLoadedRef = useRef(onMetadataLoaded);

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
