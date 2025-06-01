# mp4-to-gif-converter/backend/Dockerfile
FROM python:3.13-slim

WORKDIR /app

# Install system dependencies:
# - ffmpeg: Crucial for MoviePy
# - clamav: For virus scanning (if CLAMAV_ENABLED=true)
# - Other dependencies your app might need (e.g., build-essential for some Python packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    clamav \
    # Add build-essential if any packages in requirements.txt need compilation
    # build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt requirements.txt

# Add gunicorn to requirements.txt explicitly if it's not already there.
# RUN echo "gunicorn" >> requirements.txt # <-- Only add this line if you are certain gunicorn is missing from your requirements.txt
                                        #     and you want to quickly add it during build
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8080
EXPOSE 8080

# === TEMPORARY DEBUGGING CMD ===
# This CMD will first check if gunicorn is in PATH, then try to run a simple Flask app without your full logic.
# CMD ["sh", "-c", "which gunicorn && echo 'Gunicorn found! Attempting to run simple app...' && python -c 'from flask import Flask; app=Flask(__name__); @app.route(\"/hello\")\ndef hello(): return \"Hello from Flask!\"; app.run(host=\"0.0.0.0\", port=8080)' || echo 'Gunicorn not found or simple app failed to start'"]
# CMD ["sh", "-c", "echo 'Hello from inside the container!' && sleep 3600"]
CMD ["gunicorn", "--bind", "0.0.0.0:$PORT", "app:app"]