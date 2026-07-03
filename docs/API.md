# InterviewAI API Documentation

This document outlines the API endpoints exposed by the backend services.

## Authentication Endpoints

### Register User
* **URL**: `/api/auth/register`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securepassword"
  }
  ```
* **Success Response**: `201 CREATED`

### Login User
* **URL**: `/api/auth/login`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword"
  }
  ```
* **Success Response**: `200 OK`

---

## Resume & ATS Scanner Endpoints

### Upload Resume
* **URL**: `/api/resume/upload`
* **Method**: `POST`
* **Headers**: `Content-Type: multipart/form-data`
* **Request Body**: File payload under key `resume`, optional text `jobDescription`
* **Success Response**: `201 CREATED`

### Fetch Resume History
* **URL**: `/api/resume/history`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response**: `200 OK`

---

## Mock Interview Endpoints

### Start Session
* **URL**: `/api/interview/start`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response**: `201 CREATED`

### Grade Answer
* **URL**: `/api/interview/grade-answer`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response**: `200 OK`

### Finish Session
* **URL**: `/api/interview/finish`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <token>`
* **Success Response**: `200 OK`
