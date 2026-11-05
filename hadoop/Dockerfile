# Dedicated Apache Hadoop 3.3.6 & Apache Pig 0.17.0 Environment
FROM eclipse-temurin:8-jdk-focal

ENV HADOOP_VERSION=3.3.6
ENV PIG_VERSION=0.17.0

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    curl \
    tar \
    python3 \
    nano \
    ssh \
    rsync \
    && rm -rf /var/lib/apt/lists/*

# Install Apache Hadoop
WORKDIR /opt
RUN curl -sSL https://archive.apache.org/dist/hadoop/common/hadoop-${HADOOP_VERSION}/hadoop-${HADOOP_VERSION}.tar.gz | tar -xz && \
    mv hadoop-${HADOOP_VERSION} hadoop

# Install Apache Pig
RUN curl -sSL https://archive.apache.org/dist/pig/pig-${PIG_VERSION}/pig-${PIG_VERSION}.tar.gz | tar -xz && \
    mv pig-${PIG_VERSION} pig

# Configure Environment Variables
ENV HADOOP_HOME=/opt/hadoop
ENV HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop
ENV PIG_HOME=/opt/pig
ENV PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin:$PIG_HOME/bin

WORKDIR /workspace

CMD ["pig", "-version"]

