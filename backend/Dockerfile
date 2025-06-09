FROM python:3.13-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies required for FFmpeg, ClamAV, and other libraries (e.g., OpenCV dependencies)
# Install FFmpeg for video processing
# Install ClamAV for antivirus scanning
# Install libgl1 for OpenCV if used in ai_trimming
# Install ImageMagick for MoviePy's TextClip, and common fonts
# Install Microsoft Core Fonts (includes Arial)
# Enable contrib and non-free repositories for ttf-mscorefonts-installer
# Install git for yt-dlp if it needs to pull from git (though pip should handle it)
# Clean up apt caches to reduce image size
RUN sed -i 's/main/main contrib non-free/g' /etc/apt/sources.list.d/debian.sources && \
    # For older Debian/Ubuntu that might use sources.list directly:
    # sed -i 's/main$/main contrib non-free/' /etc/apt/sources.list
    apt-get update && \
    echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections && \
    apt-get install -y --no-install-recommends \
    ffmpeg \
    imagemagick \
    fonts-liberation \
    ttf-mscorefonts-installer \
    clamav \
    clamav-daemon \
    libgl1 \
    git && \
    rm -rf /var/lib/apt/lists/*


# Copy your requirements.txt first to leverage Docker's caching
# This ensures that pip installs don't rerun if only app code changes
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend application code into the container
COPY . .

# Ensure ClamAV freshclam updates its definitions on container start (or build, depending on needs)
# For production, you might want to run freshclam periodically via a cron job or separate process.
# For simplicity, we'll run it once during build.
# This assumes you might be running ClamAV in the same container. If you plan to use a separate ClamAV service,
# you can remove or modify this section.
RUN freshclam

# Expose the port your Flask application runs on
# Elastic Beanstalk defaults to port 8080 for Docker environments
EXPOSE 8080

# Command to run the Flask application using Gunicorn (a production-ready WSGI server)
# Flask's built-in server (app.run) is not suitable for production.
# We assume your main Flask app instance is named 'app' in 'app.py'.
# The --bind 0.0.0.0:8080 ensures it listens on all interfaces on port 8080.
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]