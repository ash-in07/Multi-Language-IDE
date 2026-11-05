# Multi-Language Big Data Online Lab Backend Dockerfile
FROM python:3.11-slim

# Install system utilities, GCC/G++, OpenJDK 17, and Node.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    openjdk-17-jdk-headless \
    nodejs \
    curl \
    sqlite3 \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Set Java Environment
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$JAVA_HOME/bin:$PATH

WORKDIR /app

# Copy dependency definition and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create workspace and storage directories
RUN mkdir -p /app/workspaces /app/datasets /app/hdfs_storage /app/samples

EXPOSE 5000

ENV PORT=5000
ENV FLASK_ENV=production

CMD ["python", "app.py"]

