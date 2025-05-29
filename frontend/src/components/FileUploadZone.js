import React from 'react';
import {
  Box,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  Divider,
  Icon,
  useColorModeValue,
  useToast, // Import useToast for feedback
} from '@chakra-ui/react';
import { FiUploadCloud } from 'react-icons/fi';

function FileUploadZone({
  file,
  videoUrlInput,
  isDragging,
  onFileChange,
  onVideoUrlInputChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onBrowseClick,
  fileInputRef,
}) {
  const borderColor = useColorModeValue('gray.300', 'gray.600');
  const dragActiveBg = useColorModeValue('blue.50', 'blue.900');
  const dropZoneHoverBorder = useColorModeValue('blue.400', 'blue.500');
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const dropZoneInitialBg = useColorModeValue('gray.50', 'gray.700');
  const selectedFileNameColor = useColorModeValue('blue.600', 'blue.300');

  const toast = useToast(); // Initialize toast

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/webm', 'video/x-matroska', 'video/x-msvideo']; // Added video/x-msvideo for .avi
    const maxFileSize = 100 * 1024 * 1024; // 100MB example limit

    if (!allowedTypes.includes(selectedFile.type)) {
      toast({ title: "Invalid File Type", description: "Please upload a valid video file (MP4, AVI, MOV, WEBM, MKV).", status: "error", duration: 5000, isClosable: true });
      return;
    }
    if (selectedFile.size > maxFileSize) {
      toast({ title: "File Too Large", description: `File size cannot exceed ${maxFileSize / (1024*1024)}MB.`, status: "error", duration: 5000, isClosable: true });
      return;
    }
    onFileChange({ target: { files: [selectedFile] } }); // Simulate event structure if onFileChange expects it
  };

  return (
    <VStack spacing={6} align="stretch" mb={8}>
      <Box
        borderWidth={2}
        borderStyle="dashed"
        borderColor={isDragging ? dropZoneHoverBorder : borderColor}
        bg={isDragging ? dragActiveBg : dropZoneInitialBg}
        borderRadius="lg"
        p={{ base: 6, md: 10 }}
        textAlign="center"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave} // Keep existing drag leave
        onDrop={(e) => {
          onDrop(e); // Call original onDrop to handle isDragging state
          const droppedFile = e.dataTransfer.files?.[0];
          if (droppedFile) {
            validateAndSetFile(droppedFile);
          }
        }}
        _hover={{ borderColor: dropZoneHoverBorder, cursor: 'pointer' }}
        transition="all 0.3s ease-in-out"
        onClick={onBrowseClick}
      >
        <Icon as={FiUploadCloud} w={{base: 10, md: 12}} h={{base: 10, md: 12}} color={labelColor} mb={3} />
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
          onChange={(e) => {
            const selectedFile = e.target.files?.[0];
            validateAndSetFile(selectedFile);
          }}
          ref={fileInputRef}
          display="none"
          id="fileInput"
        />
        <Button
          variant="outline"
          colorScheme="blue"
          size={{ base: 'sm', md: 'md' }}
          onClick={(e) => {
            e.stopPropagation(); // Prevent click event from bubbling to the parent Box
            onBrowseClick();
          }}
        >
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
          onChange={onVideoUrlInputChange}
          focusBorderColor="blue.500"
          size="lg"
        />
      </FormControl>
    </VStack>
  );
}

export default FileUploadZone;