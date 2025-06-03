FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    clamav \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Set environment variables
ENV PORT=8080
ENV FLASK_DEBUG=False
ENV CLAMAV_ENABLED=false

EXPOSE 8080

# Use gunicorn for production
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8080", "app:app"]
