# Career Copilot (InterviewAI)

Career Copilot is an AI-powered portal for placement success, providing a hybrid Applicant Tracking System (ATS) resume auditor and an adaptive mock interview simulator.

## Project Structure

- `frontend/` - React Frontend built with Vite, Tailwind CSS, Chart.js.
- `backend/` - Node.js/Express API Server with MongoDB (Mongoose).
- `docker/` - Docker deployment setups (Dockerfiles, compose, Nginx server configurations).
- `jenkins/` - Jenkins pipeline scripts for continuous deployment.
- `.github/workflows/` - GitHub Actions pipeline checks for front-end, back-end, and docker.
- `docs/` - System APIs, database models, and deployment configurations.
- `scripts/` - Maintenance and utility helpers.

## Running Locally

To run the application locally:

### Option A: Standard Execution
1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Option B: Docker Compose
Build and start all services (Frontend, Backend, MongoDB) in containers:
```bash
docker compose up -d --build
```
