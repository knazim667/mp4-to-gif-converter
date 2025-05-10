--- /dev/null
+++ b/README.md
@@ -0,0 +1,209 @@
+# MP4 to GIF & Short Video Converter
+
+This project is a web application that allows users to convert MP4 videos (or videos from URLs like YouTube) into animated GIFs or short MP4 clips with various customization options.
+
+## Features
+
+*   **Video Upload:** Upload video files directly from your computer.
+*   **URL Processing:** Convert videos by providing a URL (supports direct video links and sites like YouTube, Vimeo via yt-dlp).
+*   **Trimming:** Select specific start and end times for the output.
+    *   **Scene Detection:** Automatically detects scene changes to suggest trim points.
+*   **Output Format:**
+    *   Generate animated GIFs.
+    *   Generate short MP4 video clips.
+*   **Audio Control:** Option to include or exclude audio when outputting as MP4.
+*   **Customization Options:**
+    *   **FPS (Frames Per Second):** Control the frame rate of the output GIF.
+    *   **Width:** Set the output width (height is adjusted proportionally).
+    *   **Text Overlay:** Add custom text to your video/GIF.
+        *   Font Size
+        *   Font Style
+        *   Text Color
+        *   Text Background Color
+        *   Text Position (center, top-left, etc.)
+    *   **Speed Factor:** Adjust the playback speed of the output.
+    *   **Reverse:** Play the output video/GIF in reverse.
+*   **Video Preview:** Playable preview of the uploaded/processed video before conversion.
+*   **Responsive UI:** User interface built with Chakra UI for a good experience on different devices.
+*   **File Scanning:** (Optional) Integrates with ClamAV to scan uploaded files for viruses.
+*   **S3 Integration:** Uses AWS S3 for storing uploaded and processed video files.
+
+## Tech Stack
+
+**Frontend:**
+*   React
+*   Chakra UI (Component Library)
+*   Video.js (Video Player)
+*   Axios (HTTP Client)
+
+**Backend:**
+*   Python
+*   Flask (Web Framework)
+*   MoviePy (Video Editing Library)
+*   Boto3 (AWS SDK for Python - for S3)
+*   yt-dlp (Video Downloading from URLs)
+*   Pillow (Image processing, often a dependency of MoviePy)
+*   python-dotenv (Environment variable management)
+*   ClamAV (Antivirus scanner, optional)
+
+**Infrastructure:**
+*   AWS S3 (for file storage)
+
+## Prerequisites
+
+Before you begin, ensure you have met the following requirements:
+
+*   **Node.js and npm (or yarn):** For running the frontend. (Node.js >= 16 recommended)
+*   **Python:** For running the backend. (Python 3.9+ recommended)
+*   **pip:** Python package installer.
+*   **FFmpeg:** Required by MoviePy for video processing. Ensure it's installed and accessible in your system's PATH.
+*   **ClamAV:** (Optional, if `CLAMAV_ENABLED=true` in backend `.env`) Antivirus daemon (`clamd`) and command-line scanner (`clamscan`).
+*   **AWS Account and S3 Bucket:** For file storage.
+*   **Git:** For cloning the repository.
+
+## Setup & Installation
+
+1.  **Clone the repository:**
+    ```bash
+    git clone <your-repository-url>
+    cd mp4-to-gif-converter
+    ```
+
+2.  **Backend Setup:**
+    ```bash
+    cd backend
+
+    # Create and activate a virtual environment (recommended)
+    python -m venv venv
+    source venv/bin/activate  # On Windows: venv\Scripts\activate
+
+    # Install Python dependencies
+    pip install -r requirements.txt
+
+    # Create a .env file in the 'backend' directory
+    # Copy .env.example to .env if you have one, or create it manually
+    # Add your AWS credentials, S3 bucket name, and other configurations
+    touch .env
+    ```
+    **Backend `.env` file example (`backend/.env`):**
+    ```env
+    AWS_ACCESS_KEY_ID=your_aws_access_key_id
+    AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
+    AWS_REGION=your_aws_s3_bucket_region # e.g., us-east-1
+    S3_BUCKET=your_s3_bucket_name
+    CLAMAV_ENABLED=true # or false to disable
+    # FLASK_DEBUG=True # For development
+    ```
+
+3.  **Frontend Setup:**
+    ```bash
+    cd ../frontend
+
+    # Install JavaScript dependencies
+    npm install
+    # or
+    # yarn install
+
+    # Create a .env file in the 'frontend' directory
+    touch .env
+    ```
+    **Frontend `.env` file example (`frontend/.env`):**
+    ```env
+    REACT_APP_API_URL=http://localhost:5000
+    ```
+
+## Running the Application
+
+1.  **Start the Backend Server:**
+    Open a terminal, navigate to the `backend` directory, and activate the virtual environment if you haven't already:
+    ```bash
+    cd backend
+    source venv/bin/activate # Or venv\Scripts\activate on Windows
+    python app.py
+    ```
+    The backend server will typically start on `http://localhost:5000`.
+
+2.  **Start the Frontend Development Server:**
+    Open another terminal, navigate to the `frontend` directory:
+    ```bash
+    cd frontend
+    npm start
+    # or
+    # yarn start
+    ```
+    The frontend application will typically open in your browser at `http://localhost:3000`.
+
+## Environment Variables
+
+**Backend (`backend/.env`):**
+*   `AWS_ACCESS_KEY_ID`: Your AWS IAM user access key ID.
+*   `AWS_SECRET_ACCESS_KEY`: Your AWS IAM user secret access key.
+*   `AWS_REGION`: The AWS region where your S3 bucket is located.
+*   `S3_BUCKET`: The name of your AWS S3 bucket used for storage.
+*   `CLAMAV_ENABLED`: Set to `true` to enable ClamAV file scanning, `false` to disable.
+*   `FLASK_APP`: (Optional, usually `app.py`)
+*   `FLASK_ENV`: (Optional, set to `development` for debug mode)
+*   `PORT`: (Optional, defaults to 5000 if not set in `app.py`'s run command)
+
+**Frontend (`frontend/.env`):**
+*   `REACT_APP_API_URL`: The URL of the backend API (e.g., `http://localhost:5000`).
+
+## Project Structure
+
+```
+mp4-to-gif-converter/
+├── backend/
+│   ├── app.py              # Main Flask application file, API routes
+│   ├── utils/
+│   │   ├── video_processing.py # Core video conversion logic (MoviePy)
+│   │   └── ai_trimming.py      # Scene detection logic
+│   ├── requirements.txt    # Python dependencies
+│   ├── venv/               # Python virtual environment (if created)
+│   └── .env                # Backend environment variables (gitignored)
+├── frontend/
+│   ├── public/
+│   │   └── index.html
+│   ├── src/
+│   │   ├── components/
+│   │   │   ├── Upload.js       # Main UI component for upload and settings
+│   │   │   ├── VideoPlayer.js  # Video.js player component
+│   │   │   └── TrimSlider.js   # Slider component for trimming
+│   │   ├── App.js            # Main React application component
+│   │   └── index.js          # Entry point for React app
+│   ├── package.json        # Frontend dependencies and scripts
+│   └── .env                # Frontend environment variables (gitignored)
+└── README.md               # This file
+```
+
+## API Endpoints (Backend)
+
+A brief overview of the main API endpoints defined in `backend/app.py`:
+
+*   `POST /upload`: Handles direct video file uploads.
+*   `POST /process-url`: Processes videos from a provided URL.
+*   `POST /analyze`: Analyzes the video for duration, scene changes, and generates a preview URL.
+*   `POST /convert`: Converts the processed video to GIF or MP4 based on user settings.
+*   `GET /`: Home endpoint for API status check.
+
+*(Note: All endpoints also support `OPTIONS` requests for CORS preflight checks.)*
+
+## Future Enhancements (Ideas)
+
+*   More output formats (e.g., WebM).
+*   Advanced text overlay options (animations, custom font uploads).
+*   Image overlay/watermarking.
+*   User accounts and history of conversions.
+*   Batch processing.
+*   More sophisticated scene detection or smart trimming suggestions.
+*   Dockerization for easier deployment.
+
+---
+
+This README should provide a good starting point. Remember to replace placeholders like `<your-repository-url>` and ensure the AWS S3 bucket policies are correctly configured to allow your application to read/write objects.
+```

This README covers:
*   A project title and description.
*   A detailed list of features.
*   The technology stack for both frontend and backend.
*   Prerequisites needed to run the project.
*   Step-by-step setup and installation instructions for both backend and frontend.
*   Instructions on how to run both parts of the application.
*   A list of necessary environment variables with examples.
*   A simplified project structure.
*   A brief overview of the main backend API endpoints.
*   Some ideas for future enhancements.

You can copy and paste this content into your `README.md` file. Remember to replace placeholders like `<your-repository-url>` if you're cloning from a remote repository.
