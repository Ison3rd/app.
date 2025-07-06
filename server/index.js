const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chat');
const projectRoutes = require('./routes/projects');
const { authenticateSocket } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/animator-chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/projects', projectRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Join user to their personal room
  socket.join(socket.userId);

  // Join chat rooms
  socket.on('join_room', async (roomId) => {
    try {
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room ${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  });

  // Handle new messages
  socket.on('send_message', async (data) => {
    try {
      const Message = require('./models/Message');
      
      const message = new Message({
        content: data.content,
        sender: socket.userId,
        room: data.roomId,
        messageType: data.messageType || 'text',
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null
      });

      await message.save();
      await message.populate('sender', 'username role avatar');

      // Emit to all users in the room
      io.to(data.roomId).emit('receive_message', {
        _id: message._id,
        content: message.content,
        sender: message.sender,
        room: message.room,
        messageType: message.messageType,
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        timestamp: message.createdAt
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle project updates
  socket.on('project_update', async (data) => {
    try {
      // Emit to project team members
      io.to(data.projectId).emit('project_updated', data);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  });

  // Handle user typing
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user_typing', {
      userId: socket.userId,
      isTyping: data.isTyping
    });
  });

  // Handle user status updates
  socket.on('status_update', async (status) => {
    try {
      const User = require('./models/User');
      await User.findByIdAndUpdate(socket.userId, { status });
      
      // Broadcast status update to all connected users
      socket.broadcast.emit('user_status_update', {
        userId: socket.userId,
        status
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});