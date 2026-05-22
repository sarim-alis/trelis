# Real-Time Kanban Board

A full-stack real-time Kanban board application built with React, Node.js, Express, MongoDB, and Socket.IO.

## 🔗 Live Demo
- **Frontend**: [https://trelis-iota.vercel.app/](https://trelis-iota.vercel.app/)
- **Backend API**: [https://trelis-backend-6q6y.onrender.com/](https://trelis-backend-6q6y.onrender.com/)

## Features

## Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router** - Client-side routing
- **Zustand** - State management
- **@dnd-kit** - Drag and drop functionality
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client with interceptors
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database
- **Socket.IO** - Real-time WebSocket communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **cookie-parser** - Cookie handling
- **dotenv** - Environment variables

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or remote)

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp  .env

# Update .env with your values
# MONGO_URI=mongodb://localhost:27017/kanban
# JWT_SECRET=your_secret_key
# JWT_REFRESH_SECRET=your_refresh_secret
# PORT=5000
# CLIENT_URL=http://localhost:5173

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
cp .env

# Update .env with your values
# VITE_API_URL=http://localhost:5000/api
# VITE_SOCKET_URL=http://localhost:5000

# Start development server
npm run dev
```

## Usage

1. **Register/Login**
2. **Create a Board**
3. **Manage Tasks**
4. **Real-time Collaboration**
5. **Dark Mode**


## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Boards
- `POST /api/boards` - Create board
- `GET /api/boards` - Get all user boards
- `GET /api/boards/:id` - Get single board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/board/:boardId` - Get board tasks
- `PUT /api/tasks/:id` - Update task
- `PUT /api/tasks/board/:boardId/reorder` - Reorder tasks
- `DELETE /api/tasks/:id` - Delete task

### Activities
- `GET /api/activities/board/:boardId` - Get board activities
