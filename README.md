# LeaveFlow - Leave Management System

A decoupled full-stack application built with React (Frontend) and Node.js / Express (Backend).

## Project Structure

```
project/
├── client/              # React + Vite Frontend (Port 5173)
│   ├── src/             # React application source code
│   ├── assets/          # Static assets
│   ├── public/          # Public assets
│   ├── package.json     # Frontend dependencies & scripts
│   ├── vite.config.js   # Vite configuration
│   ├── index.html       # HTML entry point
│   └── .env             # Client environment variables
│
├── server/              # Node.js + Express Backend (Port 5000)
│   ├── controllers/     # Route controller logic
│   ├── routes/          # Express API route declarations
│   ├── middleware/      # Express middleware (Auth, error handling)
│   ├── services/        # Service layer & Database integrations
│   ├── utils/           # Utility functions (JWT, Password hashing)
│   ├── config/          # Configuration files
│   ├── server.js        # Main Express server entry point
│   ├── package.json     # Backend dependencies & scripts
│   └── .env             # Server environment variables
│
├── .gitignore
└── README.md
```

## Running the Application

### Option 1: Run Independent Services
1. **Start Backend**:
   ```bash
   cd server
   npm install
   npm run dev
   ```
   Server runs at http://localhost:5000

2. **Start Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   Client runs at http://localhost:5173

### Option 2: Run Unified Root Launcher
From the root directory:
```bash
npm install
npm run dev
```
Runs both services concurrently and provides preview ingress.
