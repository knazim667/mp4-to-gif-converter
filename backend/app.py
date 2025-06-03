from flask import Flask, request, jsonify, make_response # Added make_response for potential future use if needed
from flask_cors import CORS
import boto3
# from botocore.client import Config # Import Config
import os
import subprocess
import requests
import shutil
import yt_dlp  # For downloading from YouTube and other sites
import uuid  # For generating unique filenames
from flask_mail import Mail, Message

from dotenv import load_dotenv
import logging
from utils.video_processing import process_video_output
from utils.ai_trimming import detect_scenes

# Initialize Flask app
app = Flask(__name__)

# Configure CORS:
# This setup applies CORS to all routes (/*).
# It allows requests from the specified origins, with the specified methods and headers.
# Flask-CORS should automatically handle OPTIONS preflight requests for routes that have 'OPTIONS' in their methods list.
CORS(app,
     origins=["http://localhost:3000", "http://192.168.12.238:3000", "http://easygifmaker.com", "https://easygifmaker.com"], # Add your production domain later
     methods=["GET", "POST", "OPTIONS", "PUT", "DELETE"],
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=True # Often useful, especially if you plan to use cookies or auth headers
)

# Explicitly handle OPTIONS requests if Flask-CORS doesn't catch them for some reason
# This is a common pattern for ensuring OPTIONS requests are handled.
@app.before_request
def handle_preflight_requests():
    if request.method.upper() == 'OPTIONS':
        response = make_response()
        # These headers should ideally be set by Flask-CORS,
        # but we add them here as a fallback or for more direct control.
        response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 204 # 204 No Content is standard for successful preflight


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configure Flask-Mail
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

mail = Mail(app)

# S3 client initialization
# boto3 will automatically use the IAM task role if running on ECS Fargate
# and no explicit credentials are set in environment variables or code.
# It will also pick up the region from AWS_REGION environment variable if set,
# or from the EC2 instance metadata/ECS task metadata.
S3_BUCKET_NAME = os.environ.get('S3_BUCKET')
AWS_REGION = os.environ.get('AWS_REGION')

if not S3_BUCKET_NAME:
    raise ValueError("S3_BUCKET environment variable not set.")
if not AWS_REGION:
    raise ValueError("AWS_REGION environment variable not set.")

s3 = boto3.client('s3', region_name=AWS_REGION)

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
@app.route('/upload', methods=['POST', 'OPTIONS']) # Ensure OPTIONS is listed
def upload_file_route():
    # Flask-CORS should handle the OPTIONS preflight request automatically.
    # No need for: if request.method == 'OPTIONS': return jsonify({'status': 'ok'}), 200
    temp_local_path = None
    try:
        if 'video' not in request.files:
            return jsonify({'status': 'error', 'message': 'No file part in request'}), 400
        file = request.files['video']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'No file selected'}), 400

        _, file_extension = os.path.splitext(file.filename)
        s3_filename = f"upload_{uuid.uuid4().hex}{file_extension}"
        temp_local_path = f"temp_{s3_filename}"

        allowed_extensions = ('.mp4', '.avi', '.mov', '.webm', '.mkv')
        if not file_extension.lower() in allowed_extensions:
            return jsonify({'status': 'error', 'message': f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"}), 400

        file.save(temp_local_path)
        logger.info(f"Saved temporary file: {temp_local_path}")
        scan_file(temp_local_path)
        s3.upload_file(temp_local_path, S3_BUCKET_NAME, s3_filename)
        logger.info(f"Uploaded {s3_filename} to S3 bucket {S3_BUCKET_NAME}")
        return jsonify({'status': 'success', 'filename': s3_filename}), 200
    except ValueError as ve:
        logger.error(f"Upload failed: {ve}")
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except SystemError as se:
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
@app.route('/process-url', methods=['POST', 'OPTIONS']) # Ensure OPTIONS is listed
def process_url_route():
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
@app.route('/analyze', methods=['POST', 'OPTIONS']) # Ensure OPTIONS is listed
def analyze_file_route():
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
    except ValueError as ve:
        logger.error(f"Analysis failed: {ve}")
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except Exception as e:
        logger.error(f"Unexpected error during analysis: {e}", exc_info=True)
        return jsonify({'status': 'error', 'message': 'Server error during analysis'}), 500
    finally:
        if temp_input_filename and os.path.exists(temp_input_filename):
            os.remove(temp_input_filename)
            logger.info(f"Removed temporary analysis file: {temp_input_filename}")

# Convert endpoint
@app.route('/convert', methods=['POST', 'OPTIONS']) # Ensure OPTIONS is listed
def convert_file_route():
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
        include_audio = data.get('include_audio', False)
        crop_x = data.get('crop_x')
        crop_y = data.get('crop_y')
        crop_w = data.get('crop_w')
        crop_h = data.get('crop_h')

        if not s3_input_filename:
            return jsonify({'status': 'error', 'message': 'Filename required for conversion'}), 400

        base_input_name, input_ext = os.path.splitext(s3_input_filename)
        temp_input_filename = f"temp_convert_in_{uuid.uuid4().hex}{input_ext}"
        
        output_extension = ".mp4" if include_audio else ".gif"
        s3_output_filename = f"{base_input_name}_processed_{uuid.uuid4().hex[:8]}{output_extension}"
        local_temp_output_path = f"temp_convert_out_{uuid.uuid4().hex}{output_extension}"

        s3.download_file(S3_BUCKET_NAME, s3_input_filename, temp_input_filename)
        logger.info(f"Downloaded {s3_input_filename} from S3 to {temp_input_filename} for conversion")

        crop_params = None
        if crop_x is not None and crop_y is not None and crop_w is not None and crop_h is not None:
            if crop_w > 0 and crop_h > 0:
                crop_params = {'x1': crop_x, 'y1': crop_y, 'width': crop_w, 'height': crop_h}
            else:
                logger.warning(f"Invalid crop dimensions received: W={crop_w}, H={crop_h}. Ignoring crop.")

        process_video_output(
            input_path=temp_input_filename, output_path=local_temp_output_path,
            fps=fps, width=width, start=start, end=end, text=text,
            font_size=font_size, text_position=text_position, text_color=text_color,
            font_style=font_style, text_bg_color=text_bg_color,
            speed_factor=speed_factor, reverse=reverse, include_audio=include_audio,
            crop_params=crop_params
        )

        content_type = 'video/mp4' if include_audio else 'image/gif'
        s3.upload_file(local_temp_output_path, S3_BUCKET_NAME, s3_output_filename, ExtraArgs={'ContentType': content_type})
        logger.info(f"Uploaded {s3_output_filename} ({content_type}) to S3 bucket {S3_BUCKET_NAME}")

        # Define a user-friendly download filename
        download_filename = f"easygifmaker_output{output_extension}"

        presigned_output_url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': S3_BUCKET_NAME,
                'Key': s3_output_filename,
                'ResponseContentDisposition': f'attachment; filename="{download_filename}"'
            },
            ExpiresIn=3600  # 1 hour
        )
        logger.info(f"Generated presigned URL for output: {s3_output_filename}")

        return jsonify({
            'status': 'success',
            'filename': s3_output_filename,
            'url': presigned_output_url
        }), 200
    except ValueError as ve:
        logger.error(f"Conversion failed: {ve}")
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except Exception as e:
        logger.error(f"Unexpected error during conversion: {e}", exc_info=True)
        return jsonify({'status': 'error', 'message': 'Server error during conversion'}), 500
    finally:
        if temp_input_filename and os.path.exists(temp_input_filename):
            os.remove(temp_input_filename)
            logger.info(f"Removed temporary input file for conversion: {temp_input_filename}")
        if local_temp_output_path and os.path.exists(local_temp_output_path):
            os.remove(local_temp_output_path)
            logger.info(f"Removed temporary output file: {local_temp_output_path}")

# Contact Form Endpoint
@app.route('/api/contact', methods=['POST', 'OPTIONS']) # Ensure OPTIONS is listed
def handle_contact_form():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        message_body = data.get('message')

        if not all([name, email, message_body]):
            return jsonify({"message": "Missing required fields (name, email, message)"}), 400

        if "@" not in email or "." not in email:
                return jsonify({"message": "Invalid email format"}), 400

        recipient_email = os.getenv('CONTACT_FORM_RECIPIENT')
        if not recipient_email:
            logger.error("CONTACT_FORM_RECIPIENT environment variable not set.")
            return jsonify({"message": "Server configuration error for contact form."}), 500

        subject = f"New Contact Message from {name} via EasyGIFMaker.com"
        
        html_message_body = message_body.replace(os.linesep, '<br>')
        
        msg_html = f"""
        <p>You have received a new message from your EasyGIFMaker.com contact form:</p>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Message:</strong></p>
        <p>{html_message_body}</p>
        """

        msg = Message(subject, recipients=[recipient_email])
        msg.html = msg_html

        mail.send(msg)
        logger.info(f"Contact form message sent successfully from {email} to {recipient_email}")
        return jsonify({"message": "Message sent successfully!"}), 200

    except Exception as e:
        logger.error(f"Error handling contact form: {e}", exc_info=True)
        return jsonify({"message": "An error occurred while sending the message."}), 500

# Home endpoint for testing
@app.route('/')
def home():
    return jsonify({'message': 'MP4 to GIF Converter API is running!'}), 200

@app.route('/health')
def health_check():
    return 'OK', 200


if __name__ == '__main__':
#     # Fixed port configuration - use PORT from environment or default to 8080
#     # port = int(os.getenv('PORT', 8080))  # Changed from 5000 to 8080
    app.run(host='0.0.0.0', port=int(os.environ.get("PORT", 8080)))
