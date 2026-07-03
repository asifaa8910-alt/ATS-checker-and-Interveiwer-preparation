#!/bin/bash
set -e

echo "Redeploying Career Copilot docker containers..."
docker compose down
docker compose up -d --build
