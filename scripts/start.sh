#!/bin/bash
set -e

echo "Starting local development services..."
cd backend && npm run dev &
cd frontend && npm run dev
