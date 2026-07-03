# Deployment & Hosting Guide

This document describes how to deploy the InterviewAI application in production-ready environments.

## Docker Deployment (Recommended)

To run the application using Docker Compose, navigate to the project root and execute:

```bash
docker compose up -d --build
```

This starts:
- Frontend client container at `http://localhost:3000`
- Backend API server at `http://localhost:5000`
- MongoDB service on port `27017`

## CI/CD Rollouts

A Jenkinsfile is provided in `jenkins/Jenkinsfile` and handles:
- Code checkout and dependency installation
- Code unit tests verification
- Docker Compose recreation and health monitoring
