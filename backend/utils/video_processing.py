import os
from moviepy import VideoFileClip, TextClip, CompositeVideoClip
import logging
import moviepy.config as mp_config

# Explicitly set the path to ImageMagick binary (adjust based on your system)
# Example for macOS/Linux: "/usr/local/bin/magick" or "/usr/bin/convert"
# Example for Windows: "C:\\Program Files\\ImageMagick-7.1.1-Q16-HDRI\\magick.exe"
# Uncomment and adjust the line below if needed
mp_config.IMAGEMAGICK_BINARY = "/opt/homebrew/bin/magick"

logger = logging.getLogger(__name__)

def convert_to_gif(input_path, output_path, fps=10, width=320, start=None, end=None, text=None, font_size=20, text_position='center', text_color='white', font_style='Arial', text_bg_color=None):
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
        text_color (str): Color of the text (e.g., 'white', 'black', '#FF0000')
        font_style (str): Font family for the text (e.g., 'Arial', 'Times-New-Roman')
        text_bg_color (str, optional): Background color for the text box (e.g., 'black', '#80808080'). Defaults to None (transparent).
    
    Returns:
        str: Path to generated GIF
    """
    try:
        # Load video clip
        # Use a variable for the clip to be written, default to the original
        clip = VideoFileClip(input_path)
        
        # Trim the clip if start or end is provided
        if start is not None or end is not None:
            clip = clip.subclipped(start, end)
        
        # Resize the clip
        clip = clip.resized(width=width)

        clip_to_write = clip # Start with the potentially trimmed/resized clip
        # Apply text overlay if text is provided
        if text:
            txt_clip = TextClip(
                text=text, # Use keyword argument for clarity and safety
                font_size=font_size,
                color=text_color, # Use the provided text_color
                bg_color=text_bg_color, # Use the provided text_bg_color
                font=font_style, # Use the provided font_style
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
            clip_to_write = CompositeVideoClip([clip, txt_clip]) # Update the clip to write

        # Write to GIF
        # We will always write without fuzz due to persistent TypeErrors
        write_kwargs = {'fps': fps} 

        # Log whether ImageMagick is configured, but don't add fuzz
        if hasattr(mp_config, 'IMAGEMAGICK_BINARY') and mp_config.IMAGEMAGICK_BINARY is not None:
            logger.info(f"ImageMagick binary path is set ({mp_config.IMAGEMAGICK_BINARY}), but fuzz parameter is not used.")
            # write_kwargs['fuzz'] = fuzz # Do NOT add fuzz
        else:
             logger.warning("ImageMagick binary path is not set or found in config. Writing GIF without fuzz.")

        try:
            logger.info(f"Writing GIF with args: {write_kwargs}")
            clip_to_write.write_gif(output_path, **write_kwargs) # Use auto program detection
            logger.info(f"Successfully wrote GIF to: {output_path}")
        finally:
             # Ensure clip is closed
             if clip_to_write:
                 clip_to_write.close()
                 logger.debug("Closed video clip.")
        
        logger.info(f"Converted {input_path} to GIF: {output_path}")
        return output_path
    
    except Exception as e:
        logger.error(f"Conversion failed: {e}", exc_info=True) # Log traceback for better debugging
        raise