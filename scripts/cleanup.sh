#!/bin/bash
set -e

echo "Cleaning build cache, logs, and temporary variables..."
rm -rf frontend/dist frontend/.vite backend/uploads/* || true
echo "Dangling docker volumes cleanup..."
docker system prune -f || true
