# mp4-to-gif-converter/backend/Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies:
# - ffmpeg: Crucial for MoviePy
# - clamav: For virus scanning (if CLAMAV_ENABLED=true)
# - Other dependencies your app might need (e.g., build-essential for some Python packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    clamav \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt requirements.txt
# Consider creating a non-root user for security
# RUN addgroup --system app && adduser --system --group app
# USER app
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# App Runner will set the PORT environment variable (default 8080)
# Gunicorn will bind to 0.0.0.0 and this port.
ENV PORT=8080
EXPOSE 8080

# Command to run your application using Gunicorn
# Ensure app:app matches your Flask app instance (app = Flask(__name__)) in app.py
# CMD ["gunicorn", "--bind", "0.0.0.0:${PORT}", "app:app"]
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:$PORT app:app"]
