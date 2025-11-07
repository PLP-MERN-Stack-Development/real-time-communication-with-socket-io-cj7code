// server.js - Enhanced main server file for Socket.io chat application
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Socket.io configuration with enhanced options
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Enhanced data stores
const users = new Map(); // Store users with socket.id as key
const rooms = new Map(); // Store rooms and their members
const messages = new Map(); // Store messages by room
const typingUsers = new Map(); // Track typing users by room

// Initialize default room
rooms.set('general', new Set());
messages.set('general', []);

// Utility functions
const generateMessageId = () => Date.now() + Math.random().toString(36).substr(2, 9);

const getUserBySocketId = (socketId) => users.get(socketId);

const getOnlineUsers = () => {
  return Array.from(users.values()).filter(user => user.online);
};

const addMessageToRoom = (room, message) => {
  if (!messages.has(room)) {
    messages.set(room, []);
  }
  const roomMessages = messages.get(room);
  roomMessages.push(message);
  
  // Limit stored messages to prevent memory issues
  if (roomMessages.length > 1000) {
    roomMessages.splice(0, 100);
  }
};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user authentication and joining
  socket.on('user_join', (userData) => {
    const user = {
      id: socket.id,
      username: userData.username,
      online: true,
      joinedAt: new Date().toISOString(),
      currentRoom: 'general'
    };
    
    users.set(socket.id, user);
    
    // Join default room
    socket.join('general');
    if (!rooms.get('general').has(socket.id)) {
      rooms.get('general').add(socket.id);
    }
    
    // Notify all clients about updated user list
    io.emit('user_list', getOnlineUsers());
    
    // Notify room about new user
    socket.to('general').emit('user_joined', {
      username: user.username,
      message: `${user.username} joined the chat`,
      timestamp: new Date().toISOString()
    });
    
    // Send current room messages to the new user
    const roomMessages = messages.get('general') || [];
    socket.emit('room_messages', roomMessages);
    
    console.log(`${user.username} joined the chat`);
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    const user = getUserBySocketId(socket.id);
    if (!user) return;

    const message = {
      id: generateMessageId(),
      sender: user.username,
      senderId: socket.id,
      message: messageData.message,
      room: user.currentRoom,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    addMessageToRoom(user.currentRoom, message);
    
    // Broadcast to all users in the room
    io.to(user.currentRoom).emit('receive_message', message);
    
    // Clear typing indicator for this user
    handleUserTyping(socket, false);
  });

  // Handle typing indicator
  const handleUserTyping = (socket, isTyping) => {
    const user = getUserBySocketId(socket.id);
    if (!user) return;

    const room = user.currentRoom;
    
    if (isTyping) {
      typingUsers.set(socket.id, {
        username: user.username,
        room: room,
        timestamp: Date.now()
      });
    } else {
      typingUsers.delete(socket.id);
    }
    
    // Get typing users for current room
    const roomTypingUsers = Array.from(typingUsers.values())
      .filter(typingUser => typingUser.room === room)
      .map(typingUser => typingUser.username);
    
    io.to(room).emit('typing_users', roomTypingUsers);
  };

  socket.on('typing_start', () => handleUserTyping(socket, true));
  socket.on('typing_stop', () => handleUserTyping(socket, false));

  // Handle room operations
  socket.on('join_room', (roomName) => {
    const user = getUserBySocketId(socket.id);
    if (!user) return;

    // Leave current room
    if (user.currentRoom) {
      socket.leave(user.currentRoom);
      rooms.get(user.currentRoom)?.delete(socket.id);
    }

    // Join new room
    if (!rooms.has(roomName)) {
      rooms.set(roomName, new Set());
      messages.set(roomName, []);
    }
    
    rooms.get(roomName).add(socket.id);
    socket.join(roomName);
    user.currentRoom = roomName;

    // Send room messages to user
    const roomMessages = messages.get(roomName) || [];
    socket.emit('room_messages', roomMessages);
    
    // Notify room about user joining
    socket.to(roomName).emit('user_joined_room', {
      username: user.username,
      room: roomName,
      message: `${user.username} joined ${roomName}`,
      timestamp: new Date().toISOString()
    });

    // Update user list for the room
    io.to(roomName).emit('user_list', getOnlineUsers().filter(u => 
      getUserBySocketId(u.id)?.currentRoom === roomName
    ));
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const fromUser = getUserBySocketId(socket.id);
    const toUser = Array.from(users.values()).find(u => u.username === to);
    
    if (!fromUser || !toUser) return;

    const privateMessage = {
      id: generateMessageId(),
      from: fromUser.username,
      to: toUser.username,
      message: message,
      timestamp: new Date().toISOString(),
      type: 'private'
    };

    // Send to both users
    socket.emit('private_message', privateMessage);
    socket.to(toUser.id).emit('private_message', privateMessage);
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    const user = getUserBySocketId(socket.id);
    if (user) {
      user.online = false;
      
      // Notify users in the same room
      if (user.currentRoom) {
        socket.to(user.currentRoom).emit('user_left', {
          username: user.username,
          message: `${user.username} left the chat`,
          timestamp: new Date().toISOString()
        });
      }
      
      // Remove from typing users
      typingUsers.delete(socket.id);
      
      // Update user list
      io.emit('user_list', getOnlineUsers());
      
      console.log(`${user.username} disconnected: ${reason}`);
      
      // Remove user after a delay to allow reconnection
      setTimeout(() => {
        if (!socket.connected) {
          users.delete(socket.id);
        }
      }, 5000);
    }
  });

  // Handle reconnection
  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`Reconnection attempt ${attemptNumber} for ${socket.id}`);
  });

  // Get available rooms
  socket.on('get_rooms', () => {
    const roomList = Array.from(rooms.keys()).map(roomName => ({
      name: roomName,
      userCount: rooms.get(roomName).size
    }));
    socket.emit('room_list', roomList);
  });
});

// API routes
app.get('/api/messages/:room', (req, res) => {
  const roomMessages = messages.get(req.params.room) || [];
  res.json(roomMessages.slice(-100)); // Return last 100 messages
});

app.get('/api/users', (req, res) => {
  res.json(getOnlineUsers());
});

app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.keys()).map(roomName => ({
    name: roomName,
    userCount: rooms.get(roomName).size
  }));
  res.json(roomList);
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Socket.io Chat Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    users: getOnlineUsers().length,
    rooms: rooms.size,
    uptime: process.uptime()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});

export { app, server, io };