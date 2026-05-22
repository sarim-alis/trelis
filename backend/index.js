import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import axios from 'axios';
import cron from 'node-cron';
import { connectDB } from './config/db.js';
import { verifyAccessToken } from './utils/jwt.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(rateLimiter(100, 60000));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Kanban API Server' });
});

const activeUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication required'));
  }
  
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return next(new Error('Invalid token'));
  }
  
  socket.userId = decoded.userId;
  next();
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  activeUsers.set(socket.userId, socket.id);
  
  socket.on('join:board', (boardId) => {
    socket.join(boardId);
    console.log(`User ${socket.userId} joined board ${boardId}`);
    socket.to(boardId).emit('user:joined', { userId: socket.userId });
  });
  
  socket.on('leave:board', (boardId) => {
    socket.leave(boardId);
    console.log(`User ${socket.userId} left board ${boardId}`);
    socket.to(boardId).emit('user:left', { userId: socket.userId });
  });
  
  socket.on('task:update:start', (data) => {
    socket.to(data.boardId).emit('task:locked', { 
      taskId: data.taskId, 
      userId: socket.userId 
    });
  });
  
  socket.on('task:update:end', (data) => {
    socket.to(data.boardId).emit('task:unlocked', { 
      taskId: data.taskId 
    });
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
    activeUsers.delete(socket.userId);
  });
});

app.set('io', io);

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const BACKEND_URL = process.env.BACKEND_URL || 'https://trelis-backend-6q6y.onrender.com/';

const sendRequest = async () => {
  try {
    const response = await axios.get(BACKEND_URL);
    console.log(`Ping sent at ${new Date().toLocaleTimeString()}:`, response.status);
  } catch (error) {
    console.error(`Error pinging at ${new Date().toLocaleTimeString()}:`, error.message);
  }
};

cron.schedule('*/5 * * * *', () => {
  console.log(`Sending ping to ${BACKEND_URL}`);
  sendRequest();
});

sendRequest();
