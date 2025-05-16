# MP4 to GIF & Short Video Converter

This project is a web application designed to empower users to effortlessly convert MP4 videos (including those sourced from URLs like YouTube and Vimeo) into captivating animated GIFs or concise MP4 clips, all while offering a range of customization options to tailor the output to their specific needs.

## ✨ Key Features

* **Seamless Video Input:**
    * **Direct File Upload:** Easily upload video files (MP4, AVI, MOV, WEBM, MKV) directly from your local computer.
    * **Drag & Drop Upload:** Intuitive drag and drop functionality for video files.
    * **Effortless URL Processing:** Convert videos by simply providing their URL. This feature intelligently supports direct video links as well as popular platforms like YouTube and Vimeo, leveraging the power of `yt-dlp` for seamless integration.
* **Precise Trimming:**
    * **Intuitive Start and End Time Selection:** Define the exact segments of the video you want to convert using a user-friendly interface, including numerical inputs.
    * **Visual Trim Slider:** Interactive slider for selecting trim points.
    * **Intelligent Scene Detection:** Benefit from automatic scene change detection, which suggests potential trim points, streamlining the editing process.
* **Versatile Output Formats:**
    * **Animated GIF Generation:** Create high-quality animated GIFs perfect for sharing and embedding.
    * **Short MP4 Clip Creation:** Generate concise MP4 video clips suitable for various platforms.
* **Flexible Audio Control (for MP4):** Choose whether to include or exclude the audio track when generating MP4 output.
* **Extensive Customization Options:**
    * **Frame Rate Control (FPS):** Precisely adjust the frames per second of the output GIF to control its smoothness and file size.
    * **Output Width Adjustment:** Set the desired width for the output video or GIF. The height will be automatically adjusted proportionally to maintain the aspect ratio.
    * **Dynamic Text Overlays:** Add custom text to your video or GIF with a rich set of styling options:
        * Adjustable Font Size.
        * Various Font Styles (e.g., Arial, Times New Roman).
        * Customizable Text Color.
        * Selectable Text Background Color.
        * Multiple Text Position Options (e.g., center, top-left, bottom-right).
        * **Live Preview:** See text overlay changes in real-time on the video player.
    * **Visual and Numerical Cropping:**
        * **Interactive Visual Cropper:** Select crop area directly on the video preview with a draggable and resizable rectangle. Defaults to a 75% centered selection for new crops.
        * **Numerical Inputs:** Specify exact X, Y, Width, and Height for cropping.
    * **Playback Speed Manipulation:** Modify the playback speed of the output video or GIF to create slow-motion or fast-motion effects.
    * **Reverse Playback:** Play the output video or GIF in reverse for creative effects.
* **Quick Presets:**
    * Pre-defined configurations for common use cases (e.g., "High-Quality GIF," "Small Email GIF," "Social Media MP4," "Animated Emoji").
    * "Default (Custom)" preset for full manual control.
* **Interactive Video Preview:**
    * Enjoy a playable preview of the uploaded or processed video using `video.js`.
    * Live updates for text overlays.
* **User-Friendly Interface:**
    * **Responsive Design:** Built with Chakra UI for a seamless experience across various devices (desktop, tablet, mobile).
    * **Dark Mode Support:** Adapts to system light/dark themes.
    * **Tabbed Settings:** Editing options are organized into "Trim," "Output," "Crop," "Text Overlay," and "Effects" tabs.
    * **Progress Indicators:** Clear visual feedback for uploads (percentage & progress bar), analysis, and conversion.
    * **Informative Alerts:** User-friendly messages for success, errors, and information.
* **Optional File Security:** Integrates with ClamAV (if enabled) to perform optional virus scanning on uploaded files, enhancing security.
* **Scalable Cloud Storage:** Leverages AWS S3 for efficient and reliable storage of both uploaded and processed video files.
* **Output Display & Download:** Preview the converted file and download it easily.

## 🛠️ Tech Stack

**Frontend:**

* React - A JavaScript library for building user interfaces.
* Chakra UI - A simple, modular component library for React.
* Video.js - An open source HTML5 video player.
* Axios - A promise-based HTTP client for the browser and Node.js.

**Backend:**

* Python - A versatile and powerful programming language.
* Flask - A lightweight and flexible micro web framework for Python.
* MoviePy - A Python library for video editing.
* Boto3 - The AWS SDK for Python, used for interacting with AWS S3.
* yt-dlp - A youtube-dl fork with additional features and fixes for downloading videos from various URLs.
* Pillow - A powerful image processing library for Python (often a dependency of MoviePy).
* python-dotenv - A library for reading key-value pairs from a `.env` file into environment variables.
* ClamAV - An open-source antivirus engine (optional).

**Infrastructure:**

* AWS S3 - Scalable object storage service.

## ⚙️ Prerequisites

Before diving into the setup, ensure you have the following installed and configured:

* **Node.js and npm (or yarn):** Required for running the frontend development server and managing frontend dependencies (Node.js version 16 or higher is recommended). You can download them from nodejs.org or yarnpkg.com.
* **Python:** Necessary for running the backend application (Python 3.9 or higher is recommended). Download it from python.org.
* **pip:** The package installer for Python, usually included with Python installations.
* **FFmpeg:** A crucial command-line tool used by MoviePy for video processing. Make sure it's installed on your system and accessible through your system's PATH environment variable. You can typically install it using your operating system's package manager (e.g., `sudo apt-get install ffmpeg` on Debian/Ubuntu, `brew install ffmpeg` on macOS).
* **ClamAV (Optional):** If you intend to enable virus scanning (`CLAMAV_ENABLED=true` in the backend `.env`), ensure you have the ClamAV daemon (`clamd`) and the command-line scanner (`clamscan`) installed and running on your system. Installation instructions vary depending on your operating system.
* **AWS Account and S3 Bucket:** You will need an active AWS account and an S3 bucket created to store uploaded and processed video files.
* **Git:** For cloning the project repository. Download it from git-scm.com.

## 🛠️ Setup and Installation

Follow these steps to get the application up and running:

1.  **Clone the Repository:**
    Open your terminal and execute the following command, replacing `<your-repository-url>` with the actual URL of your project repository:

    ```bash
    git clone <your-repository-url>
    cd mp4-to-gif-converter
    ```

2.  **Backend Setup:**
    Navigate to the `backend` directory in your terminal:

    ```bash
    cd backend
    ```

    * **Create and Activate Virtual Environment (Recommended):** This isolates the project's dependencies.

        ```bash
        python -m venv venv
        source venv/bin/activate  # On macOS and Linux
        # venv\Scripts\activate  # On Windows
        ```

    * **Install Python Dependencies:** Install all the necessary Python packages listed in the `requirements.txt` file.

        ```bash
        pip install -r requirements.txt
        ```

    * **Configure Environment Variables:** Create a `.env` file in the `backend` directory to store sensitive information like AWS credentials. You can start by copying the example file (if provided) or creating it manually.

        ```bash
        touch .env
        ```

        **Example `backend/.env` file (`backend/.env`):**

        ```env
        AWS_ACCESS_KEY_ID=your_aws_access_key_id
        AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
        AWS_REGION=your_aws_s3_bucket_region # e.g., us-east-1
        S3_BUCKET=your_s3_bucket_name
        CLAMAV_ENABLED=true # Set to 'false' to disable ClamAV
        # FLASK_DEBUG=True # Uncomment for development debug mode
        ```

        **Important:** Ensure you replace the placeholder values with your actual AWS credentials and S3 bucket details.

3.  **Frontend Setup:**
    Navigate back to the project's root directory and then into the `frontend` directory:

    ```bash
    cd ../frontend
    ```

    * **Install JavaScript Dependencies:** Install all the required JavaScript packages using npm or yarn.

        ```bash
        npm install
        ```

        **Alternatively, if you use yarn:**

        ```bash
        yarn install
        ```

    * **Configure Environment Variables:** Create a `.env` file in the `frontend` directory to store frontend-specific configurations.

        ```bash
        touch .env
        ```

        **Example `frontend/.env` file (`frontend/.env`):**

        ```env
        REACT_APP_API_URL=http://localhost:5000
        ```

        Ensure `REACT_APP_API_URL` points to the address where your backend server will be running.

## 🚀 Running the Application

Follow these instructions to start both the backend and frontend servers:

1.  **Start the Backend Server:**
    Open a new terminal window, navigate to the `backend` directory, and activate the virtual environment if you haven't already:

    ```bash
    cd backend
    source venv/bin/activate # Or venv\Scripts\activate on Windows
    python app.py
    ```

    The backend server will typically start and be accessible at `http://localhost:5000`. You should see output in the terminal indicating that the Flask development server is running.

2.  **Start the Frontend Development Server:**
    Open another terminal window, navigate to the `frontend` directory:

    ```bash
    cd frontend
    npm start
    # or
    # yarn start
    ```

    This command will usually open the frontend application in your default web browser, typically at `http://localhost:3000`. The frontend will then communicate with the backend server running on port 5000.

## ⚙️ Environment Variables

Here's a more detailed explanation of the environment variables used by the application:

**Backend (`backend/.env`):**

* `AWS_ACCESS_KEY_ID`: Your AWS IAM user's access key ID, which grants programmatic access to your AWS resources.
* `AWS_SECRET_ACCESS_KEY`: Your AWS IAM user's secret access key, used in conjunction with the access key ID to authenticate your requests to AWS. **Treat this as highly sensitive information.**
* `AWS_REGION`: The specific AWS region where your S3 bucket is located (e.g., `us-east-1`, `eu-west-2`). Ensure this matches your bucket's region.
* `S3_BUCKET`: The name of the AWS S3 bucket that will be used to store uploaded and processed video files.
* `CLAMAV_ENABLED`: A boolean value (`true` or `false`) that determines whether ClamAV virus scanning will be performed on uploaded files. Set to `true` to enable and `false` to disable. Ensure ClamAV is properly installed and configured if you enable this.
* `FLASK_APP`: (Optional) Specifies the main Flask application file. It usually defaults to `app.py`.
* `FLASK_ENV`: (Optional) Sets the Flask environment. Setting it to `development` enables debug mode, which provides more detailed error messages and automatic reloading upon code changes. This is generally recommended for development but should be disabled in production.
* `PORT`: (Optional) Defines the port on which the Flask development server will listen. If not set here, it might be defined in the `app.py` file (typically defaults to 5000).

**Frontend (`frontend/.env`):**

* `REACT_APP_API_URL`: The base URL of your backend API. The frontend will make HTTP requests to this URL to interact with the backend (e.g., `http://localhost:5000`). The `REACT_APP_` prefix is necessary for Create React App to recognize these environment variables.

## 📂 Project Structure

mp4-to-gif-converter/
├── backend/
│   ├── app.py              # Main Flask application file, defines API routes
│   ├── utils/
│   │   ├── video_processing.py # Contains the core video conversion logic using MoviePy
│   │   └── ai_trimming.py      # Logic for automatic scene detection to suggest trim points
│   ├── requirements.txt    # Lists all Python dependencies for the backend
│   ├── venv/               # Python virtual environment directory (if created)
│   └── .env                # Backend environment variables (should be gitignored)
├── frontend/
│   ├── public/
│   │   └── index.html      # The main HTML file for the React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Upload.js       # Component for handling video uploads and conversion settings
│   │   │   ├── VideoPlayer.js  # Component integrating the Video.js player for previews
│   │   │   └── TrimSlider.js   # UI component for selecting start and end trim points
│   │   ├── App.js            # The root component of the React application
│   │   └── index.js          # The entry point for the React application
│   ├── package.json        # Defines frontend dependencies and scripts
│   └── .env                # Frontend environment variables (should be gitignored)
└── README.md               # This file, providing project information


## 🌐 API Endpoints (Backend)

Here's a brief overview of the primary API endpoints exposed by the backend application (defined in `backend/app.py`):

* `POST /upload`: Accepts direct video file uploads from the frontend.
* `POST /process-url`: Handles requests to process videos based on a provided URL.
* `POST /analyze`: Analyzes the uploaded or URL-provided video to extract information like duration and scene changes, and generates a temporary preview URL.
* `POST /convert`: Takes the processed video and user-defined settings to perform the conversion to either a GIF or an MP4 file.
* `GET /`: A basic home endpoint that can be used to check if the API server is running.

*(Note: All the above endpoints also support `OPTIONS` requests. These are automatically handled by Flask-CORS to facilitate Cross-Origin Resource Sharing (CORS) for web applications.)*

---

This comprehensive README should provide a solid foundation for understanding, setting up, and running your MP4 to GIF & Short Video Converter project. Remember to replace any placeholder values with your actual configuration details.

## 🚀 Future Enhancements (Ideas)

Here's a list of potential features and improvements we're considering for future versions:

*   **Expanded Output Formats:** Add support for converting videos to other popular formats like WebM.
*   **Advanced Text Overlay Options:**
    *   Implement more sophisticated text overlay features, such as text animations.
    *   Ability for users to upload custom fonts.
*   **Image Overlay/Watermarking:** Allow users to overlay images or add watermarks to their videos and GIFs.
*   **User Accounts and History:** Introduce user accounts to save conversion history and preferences.
*   **Batch Processing:** Enable users to upload and process multiple videos simultaneously.
*   **Enhanced Scene Detection and Smart Trimming:** Explore more advanced algorithms for scene detection and provide more intelligent trimming suggestions.
*   **Dockerization:** Containerize the application using Docker for easier deployment and management across different environments.
*   **Additional Video Effects/Filters (Beyond Speed/Reverse):**
    *   Brightness, contrast, saturation adjustments.
    *   Grayscale, Sepia filters.
*   **Enhanced Visual Cropper Features:**
    *   Aspect ratio locking for crop selection.
    *   Snapping options (to edges, center).
*   **User-Saved Configurations/Templates:**
    *   Allow users to save their current set of conversion settings as a template.
    *   Ability to load saved templates for frequent tasks.
*   **Advanced GIF-Specific Options:**
    *   Dithering options for better color quality in GIFs.
    *   Loop count control.
