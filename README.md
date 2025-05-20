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
    * **Intelligent Scene Detection:** Benefit from automatic scene change detection (via `ai_trimming.py`), which suggests potential trim points, streamlining the editing process.
* **Versatile Output Formats:**
    * **Animated GIF Generation:** Create high-quality animated GIFs perfect for sharing and embedding.
    * **Short MP4 Clip Creation:** Generate concise MP4 video clips suitable for various platforms.
* **Flexible Audio Control (for MP4):** Choose whether to include or exclude the audio track when generating MP4 output.
* **Extensive Customization Options (powered by `video_processing.py`):**
    * **Frame Rate Control (FPS):** Precisely adjust the frames per second of the output GIF to control its smoothness and file size.
    * **Output Width Adjustment:** Set the desired width for the output video or GIF. The height will be automatically adjusted proportionally to maintain the aspect ratio.
    * **Visual and Numerical Cropping:**
        * **Interactive Visual Cropper:** Select crop area directly on the video preview with a draggable and resizable rectangle. Defaults to a 75% centered selection for new crops.
        * **Numerical Inputs:** Specify exact X, Y, Width, and Height for precise cropping.
    * **Dynamic Text Overlays:** Add custom text to your video or GIF with a rich set of styling options:
        * Adjustable Font Size.
        * Various Font Styles (e.g., Arial, Times New Roman).
        * Customizable Text Color.
        * Selectable Text Background Color.
        * Multiple Text Position Options (e.g., center, top-left, bottom-right).
        * **Live Preview:** See text overlay changes in real-time on the video player.
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
    * **Navigation:** Includes a persistent Navbar with a link to the homepage and a Footer with links to informational pages (About, Contact, FAQ, Privacy).
    * **Homepage Tips:** Provides quick tips and an overview of the tool for new users.
    * **Progress Indicators:** Clear visual feedback for uploads (percentage & progress bar), analysis, and conversion.
    * **Informative Alerts:** User-friendly messages for success, errors, and information.
* **Contact Form with Email Notifications:**
    * Users can send messages via a contact form.
    * Backend processes these messages and sends them to a designated email address.
* **Optional File Security:** Integrates with ClamAV (if enabled) to perform optional virus scanning on uploaded files, enhancing security.
* **Scalable Cloud Storage:** Leverages AWS S3 for efficient and reliable storage of both uploaded and processed video files.
* **Output Display & Download:** Preview the converted file and download it easily.

## 🛠️ Tech Stack

**Frontend:**

* React - A JavaScript library for building user interfaces.
* Chakra UI - A simple, modular component library for React.
* Video.js - An open source HTML5 video player.
* Axios - A promise-based HTTP client for the browser and Node.js.
* React Router DOM - For client-side routing.
* React Helmet Async - For managing document head elements (titles, meta tags).

**Backend:**

* Python - A versatile and powerful programming language.
* Flask - A lightweight and flexible micro web framework for Python.
* Flask-CORS - For handling Cross-Origin Resource Sharing.
* Flask-Mail - For sending emails from the application.
* MoviePy - A Python library for video editing.
* Boto3 - The AWS SDK for Python, used for interacting with AWS S3.
* yt-dlp - A youtube-dl fork with additional features and fixes for downloading videos from various URLs.
* Pillow - A powerful image processing library for Python (often a dependency of MoviePy).
* python-dotenv - A library for reading key-value pairs from a `.env` file into environment variables.
* OpenCV (cv2) - Used for scene detection in `ai_trimming.py`.
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
* **Email Account for Sending (e.g., Gmail with App Password):** If setting up the contact form, you'll need an email account configured for SMTP sending.
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

    * **Configure Environment Variables:** Create a `.env` file in the `backend` directory.

        ```bash
        touch .env
        ```

        **Example `backend/.env` file:**

        ```env
        AWS_ACCESS_KEY_ID=your_aws_access_key_id
        AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
        AWS_REGION=your_aws_s3_bucket_region # e.g., us-east-1
        S3_BUCKET=your_s3_bucket_name
        CLAMAV_ENABLED=true # Set to 'false' to disable ClamAV
        FLASK_DEBUG=True # Set to 'False' for production

        # Email Configuration for Flask-Mail (e.g., for Gmail)
        MAIL_SERVER=smtp.gmail.com
        MAIL_PORT=587
        MAIL_USE_TLS=True
        MAIL_USE_SSL=False
        MAIL_USERNAME=your.gmail.address@gmail.com
        MAIL_PASSWORD=your_gmail_app_password # Use an App Password if 2FA is enabled
        MAIL_DEFAULT_SENDER='EasyGIFMaker Contact <your.gmail.address@gmail.com>'
        CONTACT_FORM_RECIPIENT=your_receiving_email@example.com # Where contact messages will be sent
        ```

        **Important:** Replace placeholder values with your actual credentials and details.

3.  **Frontend Setup:**
    Navigate back to the project's root directory and then into the `frontend` directory:

    ```bash
    cd ../frontend
    ```

    * **Install JavaScript Dependencies:**

        ```bash
        npm install
        # or
        # yarn install
        ```

    * **Configure Environment Variables:** Create a `.env` file in the `frontend` directory.

        ```bash
        touch .env
        ```

        **Example `frontend/.env` file:**

        ```env
        REACT_APP_API_URL=http://localhost:5000
        ```

        Ensure `REACT_APP_API_URL` points to your backend server.

## 🚀 Running the Application

1.  **Start the Backend Server:**
    Open a terminal, navigate to `backend/`, activate the virtual environment, and run:

    ```bash
    python app.py
    ```
    The backend will typically run on `http://localhost:5000`.

2.  **Start the Frontend Development Server:**
    Open another terminal, navigate to `frontend/`, and run:

    ```bash
    npm start
    # or
    # yarn start
    ```
    The frontend will typically open at `http://localhost:3000`.

## ⚙️ Environment Variables

**Backend (`backend/.env`):**

* `AWS_ACCESS_KEY_ID`: Your AWS IAM user's access key ID.
* `AWS_SECRET_ACCESS_KEY`: Your AWS IAM user's secret access key.
* `AWS_REGION`: The AWS region of your S3 bucket (e.g., `us-east-1`).
* `S3_BUCKET`: The name of your AWS S3 bucket.
* `CLAMAV_ENABLED`: `true` or `false` to enable/disable ClamAV virus scanning.
* `FLASK_DEBUG`: `True` for development (enables debug mode, auto-reloading), `False` for production.
* `MAIL_SERVER`: SMTP server address (e.g., `smtp.gmail.com`).
* `MAIL_PORT`: SMTP server port (e.g., `587` for TLS, `465` for SSL).
* `MAIL_USE_TLS`: `True` or `False` to enable TLS.
* `MAIL_USE_SSL`: `True` or `False` to enable SSL.
* `MAIL_USERNAME`: Your email account username for SMTP authentication.
* `MAIL_PASSWORD`: Your email account password or App Password for SMTP.
* `MAIL_DEFAULT_SENDER`: The "From" address for emails sent by the application (e.g., `'Your App Name <you@example.com>'`).
* `CONTACT_FORM_RECIPIENT`: The email address where contact form submissions will be sent.
* `PORT`: (Optional) Port for the Flask server (defaults to 5000 if not set in `app.py` or here).

**Frontend (`frontend/.env`):**

* `REACT_APP_API_URL`: The base URL of your backend API (e.g., `http://localhost:5000`).

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
│   ├── src/source
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

* `POST /upload`: Accepts direct video file uploads.
* `POST /process-url`: Handles video processing from a provided URL.
* `POST /analyze`: Analyzes video for duration, scene changes, and generates a preview URL.
* `POST /convert`: Performs video conversion based on user settings.
* `POST /api/contact`: Receives contact form submissions and sends an email.
* `GET /`: Basic health check endpoint for the API.

*(Note: All endpoints support `OPTIONS` requests, handled by Flask-CORS for Cross-Origin Resource Sharing.)*

---

This comprehensive README should provide a solid foundation for understanding, setting up, and running your MP4 to GIF & Short Video Converter project.

## 🚀 Future Enhancements (Ideas)

Here's a list of potential features and improvements for future versions:

*   **Expanded Output Formats:** Add support for converting videos to other formats like WebM.
*   **Advanced Text Overlay Options:**
    *   Implement text animations.
    *   Allow users to upload custom fonts.
*   **Image Overlay/Watermarking:** Enable users to overlay images or add watermarks.
*   **User Accounts and History:** Introduce user accounts to save conversion history and preferences.
*   **Batch Processing:** Allow users to upload and process multiple videos simultaneously.
*   **More Sophisticated Scene Detection:** Explore advanced algorithms for more nuanced scene detection.
*   **Dockerization:** Containerize the application for easier deployment and scalability.
*   **Additional Video Effects/Filters:**
    *   Brightness, contrast, saturation adjustments.
    *   Artistic filters (e.g., Grayscale, Sepia).
*   **Enhanced Visual Cropper Features:**
    *   Aspect ratio locking during crop selection.
    *   Snapping options (to edges, center).
*   **User-Saved Configurations/Templates:**
    *   Allow users to save their custom conversion settings as templates.
*   **Advanced GIF-Specific Options:**
    *   Dithering options for improved color quality in GIFs.
    *   Control over GIF loop counts.
*   **Direct Social Media Sharing:** Integrate options to share converted GIFs/videos directly.
*   **Internationalization (i18n):** Support for multiple languages in the UI.
