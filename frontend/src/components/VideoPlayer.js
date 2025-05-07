import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Box, Heading, useColorModeValue } from '@chakra-ui/react'; // Added useColorModeValue

function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  // Chakra UI color mode values for consistency with Upload.js
  const playerBoxBg = useColorModeValue('gray.100', 'gray.700'); // Lighter background for the player box
  const headingColor = useColorModeValue('gray.700', 'whiteAlpha.800');

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) {
      return; // Exit if video element is not available
    }

    // Dispose of the existing player if it exists
    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    // If a new src is provided, initialize a new player
    if (src) {
      // Ensure the video element is clean before re-initializing
      // This can help if video.js leaves behind artifacts
      videoElement.innerHTML = ''; 

      const options = {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true, // Makes the player responsive
        sources: [{
          src: src,
          // Attempt to infer type, or default to video/mp4
          // For S3 presigned URLs, the browser usually figures it out,
          // but being explicit can sometimes help.
          type: src.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
        }]
      };

      playerRef.current = videojs(videoElement, options, function onPlayerReady() {
        // videojs.log('Player is ready.');
        // You can add event listeners here if needed
        // For example, to handle errors:
        // this.on('error', function() {
        //   videojs.log('Player Error:', this.error());
        // });
      });
    }

    // Cleanup function to dispose the player on component unmount or before src changes again
    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src]); // Re-run this effect ONLY when the src prop changes

  if (!src) { // Don't render the player box if there's no source
    return null;
  }

  return (
    <Box bg={playerBoxBg} borderRadius="lg" p={4} mt={6} boxShadow="sm">
      <Heading as="h4" size="sm" color={headingColor} mb={3} textAlign="left">
        Video Preview
      </Heading>
      <div data-vjs-player> {/* data-vjs-player is important for video.js to find the element */}
        <video ref={videoRef} className="video-js vjs-big-play-centered vjs-fluid" />
      </div>
    </Box>
  );
}

export default VideoPlayer;
