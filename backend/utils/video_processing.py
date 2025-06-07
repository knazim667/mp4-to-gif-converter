import os
# For MoviePy 2.x, moviepy.editor is still the primary way to import.
from moviepy import VideoFileClip, TextClip, CompositeVideoClip, vfx
# Effect classes like Crop, Resize, TimeMirror are available via vfx in MoviePy 2.x

import logging

# Configure logging
logger = logging.getLogger(__name__)
from typing import Optional, Dict, Union, Tuple
from moviepy.video.VideoClip import ColorClip  # Ensure ColorClip is globally available

def process_video_output(
    input_path: str,
    output_path: str,
    fps: int = 10,
    width: Optional[int] = 320,
    height: Optional[int] = None,
    start: Optional[float] = None,
    end: Optional[float] = None,
    text: Optional[str] = None,
    font_size: int = 20,
    text_position: Union[str, Tuple[Union[str, int], Union[str, int]]] = 'center',
    text_color: str = 'white',
    font_style: str = 'Arial',
    text_bg_color: Optional[str] = None,
    speed_factor: float = 1.0,
    reverse: bool = False,
    include_audio: bool = False,
    crop_params: Optional[Dict[str, int]] = None
) -> str:
    """
    Process a video file to GIF or MP4 with optional trimming, text overlay, speed, and reverse using MoviePy 2.x.
    The output format is determined by the extension of output_path.
    If include_audio is True and output_path ends with .mp4, audio will be included.

    Args:
        input_path (str): Path to the input video file.
        output_path (str): Path where the output file will be saved.
        fps (int): Frames per second for the output (default: 10 for GIF, original for MP4).
        width (int, optional): Width of the output file in pixels. If None and height is None, no resize.
                               If one is None, it's calculated to maintain aspect ratio. (default: 320)
        height (int, optional): Height of the output file in pixels. If None, calculated to maintain aspect ratio.
        start (float, optional): Start time for trimming in seconds.
        end (float, optional): End time for trimming in seconds.
        text (str, optional): Text to overlay on the video.
        font_size (int): Font size for the text overlay (default: 20).
        text_position (str or tuple): Position of the text overlay
                                      (e.g., 'center', ('left', 'top'), (50, 100)) (default: 'center').
        text_color (str): Color of the text overlay (default: 'white').
        font_style (str): Font name or path for the text overlay (default: 'Arial').
                               Ensure the font is available to MoviePy/ImageMagick.
        text_bg_color (str, optional): Background color for the text (e.g., 'black', '#80808080');
                                       None for transparent (default: None).
        speed_factor (float): Factor to change playback speed (e.g., 2.0 for 2x speed, 0.5 for half speed) (default: 1.0).
        reverse (bool): Whether to play the video in reverse (default: False).
        include_audio (bool): Whether to include audio if the output is MP4 (default: False).
        crop_params (dict, optional): Cropping parameters {'x1': int, 'y1': int, 'width': int, 'height': int}.
                                      Coordinates are from top-left.

    Returns:
        str: Path to the generated output file.
        
        Note:
            If the input video has audio, `.without_audio()` will be applied to the processed clip 
            unless `include_audio` is set to True for MP4 output.

    Raises:
        ValueError: If input parameters are invalid (e.g., start >= end, unsupported format).
        Exception: If conversion fails due to processing errors.
    """
    if not os.path.exists(input_path):
        logger.error(f"Input file not found: {input_path}")
        raise FileNotFoundError(f"Input file not found: {input_path}")

    processed_clip = None # To ensure we operate on the latest version of the clip

    try:
        with VideoFileClip(input_path, audio=True) as loaded_clip:
            processed_clip = loaded_clip # Start with the loaded clip
            logger.info(f"Loaded video clip from {input_path}, duration: {processed_clip.duration:.2f}s, size: {processed_clip.size}")

            # Trim the clip if start or end times are specified
            if start is not None or end is not None:
                start_time = start if start is not None else 0
                end_time = end if end is not None else processed_clip.duration
                if start_time < 0:
                    logger.warning(f"Start time {start_time}s is negative, using 0s.")
                    start_time = 0
                if end_time > processed_clip.duration:
                    logger.warning(f"End time {end_time}s exceeds video duration {processed_clip.duration:.2f}s. Trimming to video end.")
                    end_time = processed_clip.duration
                if start_time >= end_time:
                    logger.error(f"Start time ({start_time}s) must be less than end time ({end_time}s) for trimming.")
                    raise ValueError("Start time must be less than end time for trimming.")
                processed_clip = processed_clip.subclipped(start_time, end_time)
                logger.info(f"Trimmed clip to start: {start_time:.2f}s, end: {end_time:.2f}s. New duration: {processed_clip.duration:.2f}s")

            # Apply crop if parameters are provided
            if crop_params and all(k in crop_params for k in ['x1', 'y1', 'width', 'height']):
                try:
                    x1, y1, w, h = crop_params['x1'], crop_params['y1'], crop_params['width'], crop_params['height']
                    if not all(isinstance(v, int) for v in [x1, y1, w, h]):
                        raise ValueError("Crop parameters 'x1', 'y1', 'width', and 'height' must be integers.")
                    if w <= 0 or h <= 0:
                        raise ValueError("'width' and 'height' must be positive integers.")
                    if x1 < 0 or y1 < 0:
                        raise ValueError("'x1' and 'y1' must be non-negative integers.")
                    if (x1 + w) > processed_clip.w or (y1 + h) > processed_clip.h:
                        raise ValueError("Crop area exceeds video dimensions.")
                    crop_instance = vfx.Crop(x1=x1, y1=y1, width=w, height=h)
                    processed_clip = processed_clip.with_effects([crop_instance])
                    logger.info(f"Applied crop: x1={x1}, y1={y1}, width={w}, height={h}. New size: {processed_clip.size}")
                except Exception as crop_e:
                    logger.error(f"Error during cropping: {crop_e}. Skipping crop.", exc_info=True)

            # Apply speed factor
            if speed_factor != 1.0:
                processed_clip = processed_clip.with_speed_scaled(factor=speed_factor)
                logger.info(f"Applied speed factor: {speed_factor}. New duration: {processed_clip.duration:.2f}s")

            # Apply reverse
            if reverse:
                if processed_clip.duration is None:
                    logger.warning("Clip duration must be known to reverse it.")
                    raise ValueError("Clip duration must be known to reverse it.")
                processed_clip = processed_clip.with_effects([vfx.TimeMirror()])
                logger.info("Applied reverse effect using vfx.TimeMirror")

            # Resize the clip
            if width is not None and height is not None:
                processed_clip = processed_clip.with_effects([vfx.Resize((width, height))])
                logger.info(f"Resized clip to width: {width}, height: {height}")
            elif width is not None:
                processed_clip = processed_clip.with_effects([vfx.Resize(width=width)])
                logger.info(f"Resized clip to width: {width}, maintaining aspect ratio. New size: {processed_clip.size}")
            elif height is not None:
                processed_clip = processed_clip.with_effects([vfx.Resize(height=height)])
                logger.info(f"Resized clip to height: {height}, maintaining aspect ratio. New size: {processed_clip.size}")

            # Add text overlay if specified
            if text:
                position_map = {
                    'center': 'center', 'top-left': ('left', 'top'), 'top-center': ('center', 'top'),
                    'top-right': ('right', 'top'), 'center-left': ('left', 'center'),
                    'center-right': ('right', 'center'), 'bottom-left': ('left', 'bottom'),
                    'bottom-center': ('center', 'bottom'), 'bottom-right': ('right', 'bottom')
                }
                if isinstance(text_position, str):
                    resolved_position = position_map.get(text_position.lower().replace(" ", ""), text_position)
                elif isinstance(text_position, tuple):
                    resolved_position = text_position
                else:
                    logger.warning(f"Invalid text_position type: {type(text_position)}. Defaulting to 'center'.") # noqa
                    resolved_position = 'center'
                # Ensure that an empty string for text_bg_color is treated as None (transparent)
                actual_text_bg_color = None if not text_bg_color else text_bg_color
                try:
                    txt_clip = TextClip(
                        text=text, font_size=font_size, color=text_color,
                        font=font_style, bg_color=actual_text_bg_color
                    )
                    txt_clip = txt_clip.with_position(resolved_position).with_duration(processed_clip.duration)
                    processed_clip = CompositeVideoClip([processed_clip, txt_clip])
                    logger.info(f"Applied text overlay: '{text}' at position {resolved_position}")
                except Exception as text_e:
                    logger.error(f"Failed to create text clip for '{text}' with font '{font_style}'. Error: {text_e}. Skipping text overlay.", exc_info=True)
                    logger.warning("Common causes for text errors: Font not found or ImageMagick not configured correctly. Try a common font name like 'Arial', 'Verdana' or provide a path to a .ttf file.")

            output_is_gif = output_path.lower().endswith('.gif')
            output_is_mp4 = output_path.lower().endswith('.mp4')
            output_fps = fps
            if output_is_mp4 and hasattr(processed_clip, 'fps') and processed_clip.fps:
                output_fps = processed_clip.fps

            if output_is_gif:
                final_clip_for_output = processed_clip.without_audio() if processed_clip.audio else processed_clip
                logger.info(f"Writing GIF to {output_path} with FPS={output_fps}")
                final_clip_for_output.write_gif(output_path, fps=output_fps)
            elif output_is_mp4:
                write_kwargs = {'codec': 'libx264', 'fps': output_fps}
                if include_audio:
                    if processed_clip.audio:
                        write_kwargs['audio_codec'] = 'aac'
                        write_kwargs['audio'] = True
                        logger.info(f"Writing MP4 with audio to {output_path} with FPS={output_fps:.2f}")
                    else:
                        logger.warning(f"Audio inclusion requested for MP4, but processed clip has no audio. Writing video without audio to {output_path}.")
                        write_kwargs['audio'] = False
                else:
                    write_kwargs['audio'] = False
                    if processed_clip.audio:
                        processed_clip = processed_clip.without_audio()
                processed_clip.write_videofile(output_path, **write_kwargs)
            else:
                raise ValueError(f"Unsupported output format for {output_path}. Must be .gif or .mp4")

            logger.info(f"Successfully generated output file: {output_path}")
            return output_path

    except FileNotFoundError:
        raise
    except ValueError as ve:
        logger.error(f"Value error during video processing: {str(ve)}", exc_info=True)
        raise
    except Exception as e:
        logger.error(f"Video processing failed for {input_path}: {str(e)}", exc_info=True)
        raise

if __name__ == '__main__':
    # Create a dummy video file for testing if it doesn't exist
    if not os.path.exists('input.mp4'):
        try:
            # Ensure ColorClip is imported if used standalone here
            from moviepy import ColorClip # Corrected import for standalone use
            ColorClip(size=(640, 480), color=(0,0,0), duration=5, fps=25).write_videofile("input.mp4")
            logger.info("Created a dummy 'input.mp4' for testing.")
        except Exception as e:
            logger.error(f"Could not create dummy input.mp4: {e}. Please create it manually to run the example.")

    if os.path.exists('input.mp4'):
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(name)s - %(message)s')

        # --- Test Case 1: Basic GIF conversion (subclipped, resized) ---
        try:
            logger.info("--- Test Case 1: Basic GIF ---")
            output_gif_path = process_video_output(
                input_path='input.mp4',
                output_path='output.gif',
                fps=12,
                width=320,
                start=1,
                end=4
            )
            logger.info(f"Test Case 1 generated: {output_gif_path}")
        except Exception as e:
            logger.error(f"Test Case 1 failed: {e}", exc_info=True)

        # --- Test Case 2: MP4 with text, speed, and audio (all 2.x methods) ---
        try:
            logger.info("\n--- Test Case 2: MP4 with text, speed, audio ---")
            output_mp4_path = process_video_output(
                input_path='input.mp4',
                output_path='output_audio.mp4',
                fps=25, # Will use original if available for MP4
                width=480,
                start=0.5,
                end=4.5,
                text="MoviePy 2.x Test!",
                text_bg_color='black@0.5', # Example with alpha
                text_position='bottom-center',
                text_color='yellow',
                font_style='Arial', # Ensure this font is available
                speed_factor=1.5,
                reverse=False,
                include_audio=True,
                crop_params={'x1': 10, 'y1': 10, 'width': 600, 'height': 400} # Ensure crop area is valid for 640x480
            )
            logger.info(f"Test Case 2 generated: {output_mp4_path}")
        except Exception as e:
            logger.error(f"Test Case 2 failed: {e}", exc_info=True)

        # --- Test Case 3: Reversed video, no audio, specific height (all 2.x methods) ---
        try:
            logger.info("\n--- Test Case 3: Reversed MP4, no audio, specific height ---")
            output_mp4_rev_path = process_video_output(
                input_path='input.mp4',
                output_path='output_reversed.mp4',
                height=240, # Width will be auto-calculated
                start=1,
                end=3,
                text="Reversed & Resized",
                font_size=30,
                text_position=('center', 60), # Example tuple position
                text_color='#FF00FF',
                font_style='Arial', # Ensure this font is available
                speed_factor=1.0, # Test with normal speed but reversed
                reverse=True,
                include_audio=False,
            )
            logger.info(f"Test Case 3 generated: {output_mp4_rev_path}")
        except Exception as e:
            logger.error(f"Test Case 3 failed: {e}", exc_info=True)
    else:
        logger.warning("Cannot run examples because 'input.mp4' does not exist.")
