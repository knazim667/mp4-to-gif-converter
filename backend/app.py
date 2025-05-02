
from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
import os
import subprocess
from dotenv import load_dotenv
import logging
from utils.video_processing import convert_to_gif
from utils.ai_trimming import detect_scenes

   # Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {
       "origins": ["http://localhost:3000"],
       "methods": ["GET", "POST", "OPTIONS"],
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
           aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
       )
except Exception as e:
       logger.error(f"Failed to initialize S3 client: {e}")
       raise

   # Function to scan files with ClamAV
def scan_file(file_path):
       try:
           result = subprocess.run(['clamscan', file_path], capture_output=True, text=True)
           if 'Infected files: 0' not in result.stdout:
               logger.error(f"ClamAV scan failed for {file_path}: {result.stdout}")
               raise ValueError('File is infected')
           logger.info(f"ClamAV scan passed for {file_path}")
           return True
       except subprocess.CalledProcessError as e:
           logger.error(f"ClamAV error: {e}")
           raise

   # Upload endpoint
@app.route('/upload', methods=['POST', 'OPTIONS'])
def upload_file():
       if request.method == 'OPTIONS':
           return jsonify({'status': 'ok'}), 200

       try:
           if 'video' not in request.files:
               logger.warning("No file uploaded in request")
               return jsonify({'status': 'error', 'message': 'No file uploaded'}), 400

           file = request.files['video']
           if not file.filename:
               logger.warning("Empty filename in upload request")
               return jsonify({'status': 'error', 'message': 'No file selected'}), 400

           if file and file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
               # Save file temporarily
               file_path = f"temp_{file.filename}"
               file.save(file_path)
               logger.info(f"Saved temporary file: {file_path}")

               # Scan file with ClamAV
               scan_file(file_path)

               # Upload to S3
               s3.upload_file(file_path, os.getenv('S3_BUCKET'), file.filename)
               logger.info(f"Uploaded {file.filename} to S3 bucket {os.getenv('S3_BUCKET')}")

               # Clean up temporary file
               os.remove(file_path)
               logger.info(f"Removed temporary file: {file_path}")

               return jsonify({'status': 'success', 'filename': file.filename}), 200

           logger.warning(f"Invalid file type: {file.filename}")
           return jsonify({'status': 'error', 'message': 'Invalid file type. Use MP4, AVI, or MOV'}), 400

       except ValueError as ve:
           logger.error(f"Upload failed: {ve}")
           return jsonify({'status': 'error', 'message': str(ve)}), 400
       except Exception as e:
           logger.error(f"Unexpected error during upload: {e}")
           return jsonify({'status': 'error', 'message': 'Server error'}), 500

# Convert endpoint
@app.route('/convert', methods=['POST', 'OPTIONS'])
def convert_file():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    try:
        data = request.get_json()
        filename = data.get('filename')
        fps = data.get('fps', 10)
        width = data.get('width', 320)
        start = data.get('start', 0)
        end = data.get('end')  # Default to None if not provided

        if not filename:
            logger.warning("No filename provided in convert request")
            return jsonify({'status': 'error', 'message': 'Filename required'}), 400

        # Download file from S3
        input_path = f"temp_{filename}"
        s3.download_file(os.getenv('S3_BUCKET'), filename, input_path)
        logger.info(f"Downloaded {filename} from S3 to {input_path}")

        # Convert to GIF with optional trimming
        output_filename = f"{os.path.splitext(filename)[0]}.gif"
        output_path = f"temp_{output_filename}"
        convert_to_gif(input_path, output_path, fps, width, start, end)

        # Upload GIF to S3
        s3.upload_file(output_path, os.getenv('S3_BUCKET'), output_filename)
        logger.info(f"Uploaded {output_filename} to S3 bucket {os.getenv('S3_BUCKET')}")

        # Generate presigned URL for download
        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': os.getenv('S3_BUCKET'), 'Key': output_filename},
            ExpiresIn=3600
        )

        # Clean up temporary files
        os.remove(input_path)
        os.remove(output_path)
        logger.info(f"Removed temporary files: {input_path}, {output_path}")

        return jsonify({
            'status': 'success',
            'filename': output_filename,
            'url': presigned_url
        }), 200

    except ValueError as ve:
        logger.error(f"Conversion failed: {ve}")
        return jsonify({'status': 'error', 'message': str(ve)}), 400
    except Exception as e:
        logger.error(f"Unexpected error during conversion: {e}")
        return jsonify({'status': 'error', 'message': 'Server error'}), 500

   # Analyze endpoint for AI trimming
@app.route('/analyze', methods=['POST', 'OPTIONS'])
def analyze_file():
       if request.method == 'OPTIONS':
           return jsonify({'status': 'ok'}), 200

       try:
           data = request.get_json()
           filename = data.get('filename')

           if not filename:
               logger.warning("No filename provided in analyze request")
               return jsonify({'status': 'error', 'message': 'Filename required'}), 400

           # Download file from S3
           input_path = f"temp_{filename}"
           s3.download_file(os.getenv('S3_BUCKET'), filename, input_path)
           logger.info(f"Downloaded {filename} from S3 to {input_path}")

           # Detect scenes
           scenes = detect_scenes(input_path)

           # Clean up temporary file
           os.remove(input_path)
           logger.info(f"Removed temporary file: {input_path}")

           return jsonify({
               'status': 'success',
               'scenes': scenes
           }), 200

       except ValueError as ve:
           logger.error(f"Analysis failed: {ve}")
           return jsonify({'status': 'error', 'message': str(ve)}), 400
       except Exception as e:
           logger.error(f"Unexpected error during analysis: {e}")
           return jsonify({'status': 'error', 'message': 'Server error'}), 500

   # Home endpoint for testing
@app.route('/')
def home():
       return jsonify({'message': 'MP4 to GIF Converter API'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
