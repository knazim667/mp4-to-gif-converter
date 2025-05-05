import os
from moviepy import VideoFileClip, TextClip, CompositeVideoClip
import logging
import moviepy.config as mp_config

# Explicitly set the path to ImageMagick binary (adjust based on your system)
# Example for macOS/Linux: "/usr/local/bin/magick" or "/usr/bin/convert"
# Example for Windows: "C:\\Program Files\\ImageMagick-7.1.1-Q16-HDRI\\magick.exe"
# Uncomment and adjust the line below if needed
# mp_config.IMAGEMAGICK_BINARY = "/path/to/magick"

logger = logging.getLogger(__name__)

def convert_to_gif(input_path, output_path, fps=10, width=320, start=None, end=None, text=None, font_size=20, text_position='center'):
    """
    Convert an MP4 file to GIF using MoviePy with optional text overlay.
    
    Args:
        input_path (str): Path to input video file
        output_path (str): Path to output GIF file
        fps (int): Frames per second for GIF
        width (int): Width of output GIF (height auto-scaled)
        start (float): Start time for trimming (seconds)
        end (float): End time for trimming (seconds)
        text (str): Text to overlay on the GIF
        font_size (int): Font size for the text
        text_position (str): Position of the text (e.g., 'center', 'top-left', 'bottom-right')
    
    Returns:
        str: Path to generated GIF
    """
    try:
        # Load video clip
        clip = VideoFileClip(input_path)
        
        # Trim the clip if start or end is provided
        if start is not None or end is not None:
            clip = clip.subclipped(start, end)
        
        # Resize the clip
        clip = clip.resized(width=width)

        # Apply text overlay if text is provided
        if text:
            txt_clip = TextClip(
                text=text, # Use keyword argument for clarity and safety
                font_size=font_size,
                color='white',
                bg_color=None,
                font='Arial',
            )
            # Map text_position to MoviePy-compatible position
            position_map = {
                'center': 'center',
                'top-left': (10, 10),
                'top-right': ('right', 10),
                'bottom-left': (10, 'bottom'),
                'bottom-right': ('right', 'bottom')
            }
            position = position_map.get(text_position.lower(), 'center')
            txt_clip = txt_clip.with_position(position).with_duration(clip.duration)
            clip = CompositeVideoClip([clip, txt_clip])

        # Write to GIF
        clip.write_gif(output_path, fps=fps)
        clip.close()
        
        logger.info(f"Converted {input_path} to GIF: {output_path}")
        return output_path
    
    except Exception as e:
        logger.error(f"Conversion failed: {e}")
        raise