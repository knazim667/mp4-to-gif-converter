import os
from moviepy import VideoFileClip, TextClip, CompositeVideoClip
import logging
import moviepy.config as mp_config
# Import the main effects module
# import moviepy.video.fx.all as vfx # Not needed if using fl_time for reverse

# Set the ImageMagick binary path for your system
mp_config.IMAGEMAGICK_BINARY = "/opt/homebrew/bin/magick"

# Configure logging
logger = logging.getLogger(__name__)

def process_video_output(input_path, output_path, fps=10, width=320, height=None, start=None, end=None, text=None, font_size=20, text_position='center', text_color='white', font_style='Arial', text_bg_color=None, speed_factor=1.0, reverse=False, include_audio=False):
    """
    Process a video file to GIF or MP4 with optional trimming, text overlay, speed, and reverse using MoviePy.
    The output format is determined by the extension of output_path.
    If include_audio is True and output_path ends with .mp4, audio will be included.

    Args:
        input_path (str): Path to the input video file.
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
        speed_factor (float): Factor to change playback speed (e.g., 2.0 for 2x speed, 0.5 for half speed) (default: 1.0).
        reverse (bool): Whether to play the GIF in reverse (default: False).
        include_audio (bool): Whether to include audio if the output is MP4 (default: False).

    Returns:
        str: Path to the generated output file.

    Raises:
        Exception: If conversion fails due to invalid input or processing errors.
    """
    try:
        # Load the video clip
        # Load with audio by default, MoviePy handles it if present.
        clip = VideoFileClip(input_path, audio=True)
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

        # Apply speed change if factor is not 1.0
        if speed_factor != 1.0:
            clip = clip.with_speed_scaled(factor=speed_factor) # Use the built-in method
            logger.info(f"Applied speed factor: {speed_factor}")

        # Apply reverse effect if requested
        if reverse:
            if clip.duration is None:
                logger.error("Cannot reverse a clip with an unknown duration.")
                raise ValueError("Clip duration must be known to reverse it.")
            clip = clip[::-1] # Reverse the clip using slicing
            logger.info("Applied reverse effect")

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

        # Write the output file based on output_path extension
        output_is_gif = output_path.lower().endswith('.gif')

        if output_is_gif:
            # For GIF, audio is not supported.
            final_clip_for_output = clip.without_audio() if clip.audio else clip
            final_clip_for_output.write_gif(output_path, fps=fps)
            logger.info(f"Successfully generated GIF: {output_path}")
        elif output_path.lower().endswith('.mp4'):
            if include_audio:
                if clip.audio is None:
                    logger.warning(f"Audio inclusion requested for MP4, but processed clip has no audio. Writing video without audio. Original: {input_path}")
                    clip.write_videofile(output_path, codec='libx264', audio=False, fps=clip.fps or fps)
                else:
                    # Write MP4 with audio
                    clip.write_videofile(output_path, codec='libx264', audio_codec='aac', fps=clip.fps or fps)
                    logger.info(f"Successfully generated MP4 with audio: {output_path}")
            else:
                # Write MP4 without audio
                clip.write_videofile(output_path, codec='libx264', audio=False, fps=clip.fps or fps)
                logger.info(f"Successfully generated MP4 without audio: {output_path}")
        else:
            # This case should ideally be prevented by the calling code setting the correct output_path extension
            if 'clip' in locals() and clip.reader is not None: clip.close()
            raise ValueError(f"Unsupported output format for {output_path}. Must be .gif or .mp4")

        return output_path

    except Exception as e:
        logger.error(f"Video processing failed: {str(e)}", exc_info=True)
        raise
    finally:
        # Ensure the clip is closed
        if 'clip' in locals() and hasattr(clip, 'close'):
            try:
                clip.close()
                logger.debug("Closed video clip in finally block")
            except Exception as e_close:
                logger.error(f"Error attempting to close clip: {e_close}", exc_info=True)