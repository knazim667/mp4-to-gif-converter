import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { Box, Heading } from '@chakra-ui/react';

function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && src) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        fluid: true,
      }, () => {
        playerRef.current.src({ type: 'video/mp4', src });
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src]);

  return (
    <Box bg="gray.50" borderRadius="lg" p={4} mt={4}>
      <Heading as="h3" size="md" color="gray.800" mb={4}>
        Video Preview
      </Heading>
      <div data-vjs-player>
        <video ref={videoRef} className="video-js vjs-big-play-centered" />
      </div>
    </Box>
  );
}

export default VideoPlayer;