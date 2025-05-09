from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
import os
import subprocess
import requests
import shutil
import yt_dlp  # For downloading from YouTube and other sites
import uuid  # For generating unique filenames

from dotenv import load_dotenv
import logging
from utils.video_processing import process_video_output  # Updated import
from utils.ai_trimming import detect_scenes

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": ["http://localhost:3000", "http://192.168.12.238:3000"],
    "methods": ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize AWS S3 client
try:
    s3 = boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_REGION', 'us-east-1')
    )
    S3_BUCKET_NAME = os.getenv('S3_BUCKET')
    if not S3_BUCKET_NAME:
        logger.error("S3_BUCKET environment variable not set.")
        raise ValueError("S3_BUCKET environment variable not set.")
except Exception as e:
    logger.error(f"Failed to initialize S3 client or get S3_BUCKET: {e}")
    raise

# Function to scan files with ClamAV
def scan_file(file_path):
    clamav_enabled = os.getenv('CLAMAV_ENABLED', 'true').lower() == 'true'
    if not clamav_enabled:
        logger.info(f"ClamAV scanning is disabled. Skipping scan for {file_path}")
        return True
    try:
        result = subprocess.run(['clamscan', '--infected', '--no-summary', file_path], capture_output=True, text=True)
        if result.returncode == 1:
            logger.error(f"ClamAV scan found infection in {file_path}: {result.stdout}")
            raise ValueError('File is infected')
        elif result.returncode != 0:
            logger.error(f"ClamAV scan error for {file_path} (return code {result.returncode}): {result.stderr or result.stdout}")
            raise SystemError('ClamAV scan failed due to an error')
        logger.info(f"ClamAV scan passed for {file_path}")
        return True
    except FileNotFoundError:
        logger.error("ClamAV command 'clamscan' not found. Please ensure ClamAV is installed and in PATH.")
        raise SystemError("ClamAV is not installed or not found in PATH.")
    except Exception as e:
        logger.error(f"ClamAV unexpected error during scan of {file_path}: {e}", exc_info=True)
        raise SystemError('ClamAV execution error.')

# Function to download a file from a URL
def download_file_from_url(video_url, save_path_without_extension):
    is_youtube_like_url = any(site in video_url for site in ["youtube.com/", "youtu.be/", "vimeo.com/", "dailymotion.com/"])
    try:
        if is_youtube_like_url:
            logger.info(f"Attempting to download video using yt-dlp from URL: {video_url}")
            ydl_opts = {
                'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
                'outtmpl': f'{save_path_without_extension}.%(ext)s',
                'noplaylist': True,
                'quiet': False,
                'merge_output_format': 'mp4',
                'postprocessors': [{'key': 'FFmpegVideoConvertor', 'preferedformat': 'mp4'}],
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(video_url, download=True)
                downloaded_filename = ydl.prepare_filename(info_dict)
                if not os.path.exists(downloaded_filename):
                    logger.error(f"yt-dlp reported download but file not found: {downloaded_filename}")
                    return None
            logger.info(f"Successfully downloaded video using yt-dlp to {downloaded_filename}")
            return downloaded_filename
        else:
            logger.info(f"Attempting to download video from direct URL: {video_url}")
            file_extension = os.path.splitext(video_url.split('?')[0])[-1].lower()
            if not file_extension or file_extension not in ['.mp4', '.avi', '.mov', '.webm', '.mkv']:
                file_extension = '.mp4' # Default to .mp4 if extension is missing or not typical video
            save_path_with_extension = f"{save_path_without_extension}{file_extension}"
            with requests.get(video_url, stream=True, timeout=60) as r:
                r.raise_for_status()
                with open(save_path_with_extension, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
            logger.info(f"Successfully downloaded video from direct URL to {save_path_with_extension}")
            return save_path_with_extension
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to download video from direct URL {video_url}: {e}")
        return None
    except yt_dlp.utils.DownloadError as e:
        logger.error(f"Failed to download video using yt-dlp from URL {video_url}: {e}")
        return None
    except Exception as e:
        logger.error(f"An unexpected error occurred during download from URL {video_url}: {e}", exc_info=True)
        return None

# Upload endpoint
@app.route('/upload', methods=['POST', 'OPTIONS'])
def upload_file_route():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    temp_local_path = None # Initialize to ensure it's defined for finally block
    try:
        if 'video' not in request.files:
            return jsonify({'status': 'error', 'message': 'No file part in request'}), 400
        file = request.files['video']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'No file selected'}), 400

        _, file_extension = os.path.splitext(file.filename)
        s3_filename = f"upload_{uuid.uuid4().hex}{file_extension}"
        temp_local_path = f"temp_{s3_filename}" # Use a more unique temp name

        allowed_extensions = ('.mp4', '.avi', '.mov', '.webm', '.mkv')
        if not file_extension.lower() in allowed_extensions:
            return jsonify({'status': 'error', 'message': f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"}), 400

        file.save(temp_local_path)
        logger.info(f"Saved temporary file: {temp_local_path}")
        scan_file(temp_local_path) # Scan the locally saved file
        s3.upload_file(temp_local_path, S3_BUCKET_NAME, s3_filename)
        logger.info(f"Uploaded {s3_filename} to S3 bucket {S3_BUCKET_NAME}")
        return jsonify({'status': 'success', 'filename': s3_filename}), 200
    except ValueError as ve: # Catches ClamAV infection or other ValueErrors
        logger.error(f"Upload failed: {ve}")
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except SystemError as se: # Catches ClamAV system errors
        logger.error(f"Upload failed due to system error: {se}")
        return jsonify({'status': 'error', 'message': str(se)}), 500
    except Exception as e:
        logger.error(f"Unexpected error during upload: {e}", exc_info=True)
        return jsonify({'status': 'error', 'message': 'Server error during upload'}), 500
    finally:
        if temp_local_path and os.path.exists(temp_local_path):
            os.remove(temp_local_path)
            logger.info(f"Removed temporary file from upload: {temp_local_path}")


# Endpoint to process video from URL
@app.route('/process-url', methods=['POST', 'OPTIONS'])
def process_url_route():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    downloaded_temp_file_path = None
    try:
        data = request.get_json()
        video_url = data.get('url')
        if not video_url:
            return jsonify({'status': 'error', 'message': 'No URL provided'}), 400

        base_temp_filename_no_ext = f"temp_url_{uuid.uuid4().hex}"
        downloaded_temp_file_path = download_file_from_url(video_url, base_temp_filename_no_ext)

        if not downloaded_temp_file_path or not os.path.exists(downloaded_temp_file_path):
            return jsonify({'status': 'error', 'message': 'Failed to download or save video from URL'}), 500

        # Use the actual downloaded filename (which includes extension from yt-dlp or guessed) for S3
        s3_filename = f"url_processed_{uuid.uuid4().hex}{os.path.splitext(downloaded_temp_file_path)[1]}"
        
        scan_file(downloaded_temp_file_path)
        s3.upload_file(downloaded_temp_file_path, S3_BUCKET_NAME, s3_filename)
        logger.info(f"Uploaded {s3_filename} from URL to S3 bucket {S3_BUCKET_NAME}")
        return jsonify({'status': 'success', 'filename': s3_filename}), 200
    except ValueError as ve:
        logger.error(f"Processing URL failed: {ve}")
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except SystemError as se:
        logger.error(f"Processing URL failed due to system error: {se}")
        return jsonify({'status': 'error', 'message': str(se)}), 500
    except Exception as e:
        logger.error(f"Unexpected error during URL processing: {e}", exc_info=True)
        return jsonify({'status': 'error', 'message': 'Server error during URL processing'}), 500
    finally:
        if downloaded_temp_file_path and os.path.exists(downloaded_temp_file_path):
            os.remove(downloaded_temp_file_path)
            logger.info(f"Removed temporary file from URL processing: {downloaded_temp_file_path}")

# Analyze endpoint for AI trimming and getting video info
@app.route('/analyze', methods=['POST', 'OPTIONS'])
def analyze_file_route():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    temp_input_filename = None
    try:
        data = request.get_json()
        s3_filename_to_analyze = data.get('filename')
        if not s3_filename_to_analyze:
            return jsonify({'status': 'error', 'message': 'Filename required for analysis'}), 400

        _, input_ext = os.path.splitext(s3_filename_to_analyze)
        temp_input_filename = f"temp_analyze_{uuid.uuid4().hex}{input_ext}"

        s3.download_file(S3_BUCKET_NAME, s3_filename_to_analyze, temp_input_filename)
        logger.info(f"Downloaded {s3_filename_to_analyze} from S3 to {temp_input_filename} for analysis")

        presigned_preview_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET_NAME, 'Key': s3_filename_to_analyze},
            ExpiresIn=3600 # 1 hour
        )
        logger.info(f"Generated presigned preview URL for {s3_filename_to_analyze}")

        scenes, duration = detect_scenes(temp_input_filename)

        return jsonify({
            'status': 'success',
            'scenes': scenes,
            'duration': duration,
            'preview_url': presigned_preview_url
        }), 200
    except ValueError as ve: # Catches errors from detect_scenes if video can't be opened
        logger.error(f"Analysis failed: {ve}")
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except Exception as e: # Catches S3 errors or other unexpected issues
        logger.error(f"Unexpected error during analysis: {e}", exc_info=True)
        return jsonify({'status': 'error', 'message': 'Server error during analysis'}), 500
    finally:
        if temp_input_filename and os.path.exists(temp_input_filename):
            os.remove(temp_input_filename)
            logger.info(f"Removed temporary analysis file: {temp_input_filename}")

# Convert endpoint
@app.route('/convert', methods=['POST', 'OPTIONS'])
def convert_file_route():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200
    
    temp_input_filename = None
    local_temp_output_path = None
    try:
        data = request.get_json()
        s3_input_filename = data.get('filename')
        fps = data.get('fps', 10)
        width = data.get('width', 320)
        start = data.get('start')
        end = data.get('end')
        text = data.get('text')
        font_size = data.get('font_size', 20)
        text_position = data.get('text_position', 'center')
        text_color = data.get('text_color', 'white')
        font_style = data.get('font_style', 'Arial')
        text_bg_color = data.get('text_bg_color')
        speed_factor = data.get('speed_factor', 1.0)
        reverse = data.get('reverse', False)
        include_audio = data.get('include_audio', False) # New parameter

        if not s3_input_filename:
            return jsonify({'status': 'error', 'message': 'Filename required for conversion'}), 400

        base_input_name, input_ext = os.path.splitext(s3_input_filename)
        temp_input_filename = f"temp_convert_in_{uuid.uuid4().hex}{input_ext}"
        
        output_extension = ".mp4" if include_audio else ".gif"
        s3_output_filename = f"{base_input_name}_processed_{uuid.uuid4().hex[:8]}{output_extension}"
        local_temp_output_path = f"temp_convert_out_{uuid.uuid4().hex}{output_extension}"

        s3.download_file(S3_BUCKET_NAME, s3_input_filename, temp_input_filename)
        logger.info(f"Downloaded {s3_input_filename} from S3 to {temp_input_filename} for conversion")

        process_video_output( # Use the renamed function
            input_path=temp_input_filename, output_path=local_temp_output_path,
            fps=fps, width=width, start=start, end=end, text=text,
            font_size=font_size, text_position=text_position, text_color=text_color,
            font_style=font_style, text_bg_color=text_bg_color,
            speed_factor=speed_factor, reverse=reverse, include_audio=include_audio # Pass include_audio
        )

        content_type = 'video/mp4' if include_audio else 'image/gif'
        s3.upload_file(local_temp_output_path, S3_BUCKET_NAME, s3_output_filename, ExtraArgs={'ContentType': content_type})
        logger.info(f"Uploaded {s3_output_filename} ({content_type}) to S3 bucket {S3_BUCKET_NAME}")

        presigned_output_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET_NAME, 'Key': s3_output_filename},
            ExpiresIn=3600 # 1 hour
        )
        logger.info(f"Generated presigned URL for output: {s3_output_filename}")

        return jsonify({
            'status': 'success',
            'filename': s3_output_filename, # This is the S3 key
            'url': presigned_output_url
        }), 200
    except ValueError as ve: # Catches errors from video processing or other ValueErrors
        logger.error(f"Conversion failed: {ve}")
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except Exception as e: # Catches S3 errors or other unexpected issues
        logger.error(f"Unexpected error during conversion: {e}", exc_info=True)
        return jsonify({'status': 'error', 'message': 'Server error during conversion'}), 500
    finally:
        if temp_input_filename and os.path.exists(temp_input_filename):
            os.remove(temp_input_filename)
            logger.info(f"Removed temporary input file for conversion: {temp_input_filename}")
        if local_temp_output_path and os.path.exists(local_temp_output_path):
            os.remove(local_temp_output_path)
            logger.info(f"Removed temporary output file: {local_temp_output_path}")

# Home endpoint for testing
@app.route('/')
def home():
    return jsonify({'message': 'MP4 to GIF Converter API is running!'}), 200

if __name__ == '__main__':
    # Make sure the PORT environment variable is used if set, otherwise default to 5000
    port = int(os.getenv('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
