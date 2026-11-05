
# Use a stable Debian-based Python image
FROM python:3.11-slim-bookworm

# Install required system packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    openjdk-17-jdk-headless \
    nodejs \
    curl \
    sqlite3 \
    procps \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configure Java
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH="${JAVA_HOME}/bin:${PATH}"

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY . .

# Create required directories
RUN mkdir -p /app/workspaces /app/datasets /app/hdfs_storage /app/samples

# Render port
ENV PORT=5000
ENV FLASK_ENV=production

EXPOSE 5000

CMD ["python", "app.py"]
