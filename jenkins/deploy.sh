#!/bin/bash
set -e

echo "Deploying Career Copilot Application..."
docker compose down
docker compose up -d

echo "Application deployed successfully!"
