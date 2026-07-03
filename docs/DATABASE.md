# Database Design Schema

InterviewAI uses MongoDB as its document-store database model via Mongoose models.

## Primary Models

### User
Tracks credential listings and application authorization status:
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required)
- `role` (String: 'user' | 'admin', default: 'user')

### Resume
Metadata details about parsed candidate resume files:
- `user` (ObjectId ref User)
- `fileName` (String)
- `filePath` (String)
- `atsScore` (Number)
- `latestAnalysis` (ObjectId ref ResumeAnalysis)

### Interview
Mock interview sessions details:
- `user` (ObjectId ref User)
- `candidateName` (String)
- `type` (String)
- `targetRole` (String)
- `overallScore` (Number)
- `status` (String: 'pending' | 'completed')
