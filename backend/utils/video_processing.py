import os
from moviepy.editor import VideoFileClip
import logging

logger = logging.getLogger(__name__)

def convert_to_gif(input_path, output_path, fps=10, width=320, start=None, end=None):
    """
    Convert an MP4 file to GIF using MoviePy.
    
    Args:
        input_path (str): Path to input video file
        output_path (str): Path to output GIF file
        fps (int): Frames per second for GIF
        width (int): Width of output GIF (height auto-scaled)
        start (float): Start time for trimming (seconds)
        end (float): End time for trimming (seconds)
    
    Returns:
        str: Path to generated GIF
    """
    try:
        # Load video clip
        clip = VideoFileClip(input_path)
        
        # Trim the clip if start or end is provided
        if start is not None or end is not None:
            clip = clip.subclip(start, end)
        
        # Resize and write to GIF
        clip = clip.resize(width=width)
        clip.write_gif(output_path, fps=fps)
        clip.close()
        
        logger.info(f"Converted {input_path} to GIF: {output_path}")
        return output_path
    
    except Exception as e:
        logger.error(f"Conversion failed: {e}")
        raise