import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)

def detect_scenes(video_path, threshold=30.0):
       """
       Detect scene changes in a video using OpenCV.

       Args:
           video_path (str): Path to video file
           threshold (float): Threshold for detecting scene changes

       Returns:
           tuple: (list of scene timestamps, float duration of video)
       """
       try:
           cap = cv2.VideoCapture(video_path)
           if not cap.isOpened():
               raise ValueError("Could not open video file")

           scenes = [0.0]
           prev_frame = None
           frame_count = 0
           fps = cap.get(cv2.CAP_PROP_FPS)
           total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
           duration = total_frames / fps if fps > 0 else 0 # Calculate duration


           while True:
               ret, frame = cap.read()
               if not ret:
                   break

               frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
               if prev_frame is not None:
                   diff = cv2.absdiff(frame, prev_frame)
                   score = np.mean(diff)
                   if score > threshold:
                       scenes.append(frame_count / fps)

               prev_frame = frame
               frame_count += 1

           cap.release()
           logger.info(f"Detected {len(scenes)} scene changes in {video_path}, duration: {duration}s")
           return scenes, duration # Return duration as well

       except Exception as e:
           logger.error(f"Scene detection failed: {e}")
           raise
       