import os
from moviepy import VideoFileClip, TextClip, CompositeVideoClip
import logging
import moviepy.config as mp_config

# Set the ImageMagick binary path for your system
mp_config.IMAGEMAGICK_BINARY = "/opt/homebrew/bin/magick"

# Configure logging
logger = logging.getLogger(__name__)

def convert_to_gif(input_path, output_path, fps=10, width=320, height=None, start=None, end=None, text=None, font_size=20, text_position='center', text_color='white', font_style='Arial', text_bg_color=None):
    """
    Convert an MP4 file to GIF with optional trimming and text overlay using MoviePy.

    Args:
        input_path (str): Path to the input MP4 file.
        output_path (str): Path where the GIF will be saved.
        fps (int): Frames per second for the output GIF (default: 10).
        width (int): Width of the output GIF in pixels (default: 320).
        height (int, optional): Height of the output GIF in pixels; if None, maintains aspect ratio.
        start (float, optional): Start time for trimming in seconds.
        end (float, optional): End time for trimming in seconds.
        text (str, optional): Text to overlay on the GIF.
        font_size (int): Font size for the text (default: 20).
        text_position (str): Position of the text ('center', 'top-left', 'top-right', 'bottom-left', 'bottom-right').
        text_color (str): Text color (e.g., 'white', '#FF0000') (default: 'white').
        font_style (str): Font family for the text (e.g., 'Arial') (default: 'Arial').
        text_bg_color (str, optional): Background color for the text (e.g., 'black', '#80808080'); None for transparent.

    Returns:
        str: Path to the generated GIF file.

    Raises:
        Exception: If conversion fails due to invalid input or processing errors.
    """
    try:
        # Load the video clip
        clip = VideoFileClip(input_path)
        logger.info(f"Loaded video clip from {input_path}, duration: {clip.duration}")

        # Trim the clip if start or end times are specified
        if start is not None or end is not None:
            clip = clip.subclipped(start, end)
            logger.info(f"Trimmed clip to start: {start}, end: {end}")

        # Resize the clip
        if height is not None:
            clip = clip.resized((width, height))
            logger.info(f"Resized clip to width: {width}, height: {height}")
        else:
            clip = clip.resized(width=width)
            logger.info(f"Resized clip to width: {width}, maintaining aspect ratio")

        # Add text overlay if provided
        if text:
            txt_clip = TextClip(
                text=text,
                font_size=font_size,
                color=text_color,
                bg_color=text_bg_color if text_bg_color else None,
                font=font_style,
                stroke_color='black',
                stroke_width=1
            )
            # Define text position mapping
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
            logger.info(f"Applied text overlay: '{text}' at position {text_position}")

        # Write the GIF file
        clip.write_gif(output_path, fps=fps)
        logger.info(f"Successfully converted {input_path} to GIF: {output_path}")
        return output_path

    except Exception as e:
        logger.error(f"Conversion failed: {str(e)}")
        raise
    finally:
        # Ensure the clip is closed
        if 'clip' in locals():
            clip.close()
            logger.debug("Closed video clip")