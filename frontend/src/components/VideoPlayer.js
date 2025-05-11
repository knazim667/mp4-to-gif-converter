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

    // Dispose of the old player if it exists, before creating a new one
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    // If a new src is provided, initialize a new player
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
        console.log('Player is ready');
      });

      player.on('loadedmetadata', () => {
        // console.log('Video metadata loaded:', videoRef.current.videoWidth, videoRef.current.videoHeight);
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

    // Cleanup: dispose the player when the component unmounts or src changes
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src]); // Re-run effect only if src changes

  return (
    <Box my={4} className="video-player-container">
      <Heading as="h4" size="sm" mb={2} color={headingColor}>
        Video Preview
      </Heading>
      <Box data-vjs-player bg={playerBg} borderRadius="md" overflow="hidden">
        {/* 
          Removed inline style: style={{ width: '100%', height: 'auto' }}
          Added vjs-fluid class for responsiveness if fluid:true option is used.
        */}
        <video
          key={src} // Add key here, tied to the src
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-fluid"
        />
      </Box>
    </Box>
  );
}

export default VideoPlayer;
