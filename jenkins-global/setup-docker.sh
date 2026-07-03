#!/bin/bash
set -e

echo "Installing Docker CLI inside global_jenkins container..."
# Fetch architecture
ARCH=$(docker exec global_jenkins uname -m)
if [ "$ARCH" = "x86_64" ]; then
    DOCKER_ARCH="x86_64"
else
    DOCKER_ARCH="aarch64"
fi

echo "Detected architecture: $ARCH (downloading binary for $DOCKER_ARCH)"

# Download and extract Docker static CLI binary
docker exec -u root global_jenkins sh -c "curl -fsSL https://download.docker.com/linux/static/stable/${DOCKER_ARCH}/docker-26.1.4.tgz | tar -xz -C /tmp && mv /tmp/docker/docker /usr/bin/ && rm -rf /tmp/docker"

echo "Docker CLI installed successfully inside global_jenkins container!"
docker exec global_jenkins docker --version
