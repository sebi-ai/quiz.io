# quiz.io

`quiz.io` is a local quiz web app with a Node.js + Express backend and a static frontend interface.

The app features:
- User accounts with registration/login
- Point system and quiz history per user
- Community quizzes (automatic deletion after 1 week)
- Wish feature for new quiz topics
- Admin panel (user management, quiz moderation, wishes)

## Tech Stack

- Backend: Node.js, Express
- Password Hashing: bcryptjs
- Frontend: HTML, CSS, Vanilla JavaScript
- Data Storage: JSON files in the project directory

## Project Structure

- `index.html`: UI structure
- `style.css`: Styling
- `script.js`: Frontend logic (Auth, quiz flow, API calls)
- `server.js`: Express server and API endpoints
- `accounts.json`: User data (stored encrypted)
- `custom-quizzes.json`: Community quizzes
- `wishes.json`: User wishes
- `.secret_key`: Local AES key for encrypting `accounts.json` (auto-generated)

## Prerequisites

- Node.js 18+ (recommended)
- npm

## Installation and Startup

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open the app in your browser:

```text
http://localhost:3000
```

The default port is `3000`. You can set a different port via `PORT`.

Example:

```bash
PORT=8080 npm start
```

## Core Features

### 1. Authentication

- `POST /auth/register`: creates a new user
- `POST /auth/login`: verifies credentials
- Passwords are hashed with bcrypt
- Banned users cannot log in

### 2. User Data and Progress

- Score, completed quizzes, history, and settings are saved per user
- User data is stored on the server in `accounts.json`
- `accounts.json` is stored encrypted with AES-256-GCM

### 3. Standard Quizzes

- Predefined quizzes are included in the frontend (`script.js`)
- Points are awarded based on correct answers and response time

### 4. Community Quizzes

- Users can create their own quizzes
- Community quizzes do not award points
- Quiz names/questions/answers are limited in length server-side
- Automatically deleted after 7 days

### 5. Admin Features

- View user list
- Ban/unban users
- Moderate/delete community quizzes
- View and delete wishes

## API Overview

### Auth

- `POST /auth/register`
  - Body: `{ "username": "...", "password": "..." }`
- `POST /auth/login`
  - Body: `{ "username": "...", "password": "..." }`

### Accounts

- `GET /accounts`
  - Returns all accounts (including password-related information in the data structure)
- `GET /accounts/:username`
  - Returns a user without the password field
- `POST /accounts/update-user`
  - Body: `{ "username": "...", "user": { ... } }`
- `POST /accounts/save`
  - Body: `{ "users": { ... } }`
  - Overwrites the entire account structure

### Session/Logout

- `GET /api/verify-session`
  - Currently a placeholder (always returns `success: false`)
- `POST /api/logout`
  - Placeholder endpoint

### Custom Quizzes

- `GET /api/custom-quizzes`
- `POST /api/custom-quizzes`
  - Body: `{ "name": "...", "questions": [...], "createdBy": "..." }`
- `DELETE /api/custom-quizzes/:id`
  - Body: `{ "username": "..." }`

### Admin

- `GET /api/admin/users`
  - Header: `x-admin-user: <username>`
- `POST /api/admin/ban`
  - Body: `{ "adminUser": "...", "targetUser": "...", "ban": true|false }`
- `GET /api/admin/custom-quizzes`
  - Header: `x-admin-user: <username>`
- `DELETE /api/admin/custom-quizzes/:id`
  - Body: `{ "adminUser": "..." }`

### Wishes

- `POST /api/wishes`
  - Body: `{ "username": "...", "wish": "..." }`
- `GET /api/admin/wishes`
  - Header: `x-admin-user: <username>`
- `DELETE /api/admin/wishes/:id`
  - Body: `{ "adminUser": "..." }`

## Data Storage

### `accounts.json`

- Encrypted when written
- Legacy JSON content is automatically migrated to the encrypted format

### `custom-quizzes.json`

- Array of community quiz objects
- Expired entries are cleaned up upon API access

### `wishes.json`

- Array of wish objects (`id`, `username`, `wish`, `createdAt`)

## Security Notes

This project is intended for local use, experiments, or educational purposes.

Important points:
- There is currently no real server-side session/token management
- Admin verification is based on the provided username plus the stored role
- There is no rate limiting
- There is no CSRF protection
- Access to sensitive endpoints is not hardened for production

Do not deploy this directly to production without additional security measures.

## Development Notes

- The server serves static files from the project folder
- Frontend and backend run on the same origin (no CORS configuration needed)
- If API endpoints are unavailable, some frontend logic uses local fallbacks

## Known Areas for Improvement

- Implement real session/token authentication
- Harden role/permission concepts on the server side
- Centralize input validation
- Add tests for API and frontend logic
- Switch persistence to a database

## License

Currently, there is no license file included. If you plan to publish this, please add an appropriate license (e.g., MIT).
