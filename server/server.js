// server.js - COMPLETE WORKING VERSION
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Socket.io configuration
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Data storage
const users = new Map();
const rooms = new Map();
const messages = new Map();
const typingUsers = new Map();

// Initialize default room
rooms.set('general', new Set());
messages.set('general', []);

console.log('🚀 Starting chat server...');

// Utility functions
const getOnlineUsers = () => {
  return Array.from(users.values()).filter(user => user.online);
};

const getRoomList = () => {
  return Array.from(rooms.entries()).map(([name, usersSet]) => ({
    name: name,
    userCount: usersSet.size
  }));
};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Send connection confirmation
  socket.emit('connected', { status: 'connected', id: socket.id });

  // Handle user join
  socket.on('user_join', (userData) => {
    try {
      console.log('👤 User join:', userData.username);
      
      const user = {
        id: socket.id,
        username: userData.username,
        online: true,
        currentRoom: 'general'
      };
      
      users.set(socket.id, user);
      socket.join('general');
      rooms.get('general').add(socket.id);
      
      // Send initial data to client
      socket.emit('user_list', getOnlineUsers());
      socket.emit('room_list', getRoomList());
      socket.emit('room_messages', messages.get('general') || []);
      
      // Notify other users
      socket.to('general').emit('user_joined', {
        username: user.username,
        message: `${user.username} joined the chat`,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ ${user.username} joined successfully`);
    } catch (error) {
      console.error('Join error:', error);
    }
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    try {
      const user = users.get(socket.id);
      if (!user) return;

      console.log('💬 Message from', user.username, ':', messageData.message);
      
      const message = {
        id: Date.now(),
        sender: user.username,
        senderId: socket.id,
        message: messageData.message,
        room: user.currentRoom,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      // Store message
      if (!messages.has(user.currentRoom)) {
        messages.set(user.currentRoom, []);
      }
      messages.get(user.currentRoom).push(message);
      
      // Broadcast to room
      io.to(user.currentRoom).emit('receive_message', message);
      
    } catch (error) {
      console.error('Message error:', error);
    }
  });

  // Handle typing indicators
  socket.on('typing_start', () => {
    try {
      const user = users.get(socket.id);
      if (!user) return;

      typingUsers.set(socket.id, user.username);
      
      const roomTypingUsers = Array.from(typingUsers.values());
      io.to(user.currentRoom).emit('typing_users', roomTypingUsers);
    } catch (error) {
      console.error('Typing start error:', error);
    }
  });

  socket.on('typing_stop', () => {
    try {
      const user = users.get(socket.id);
      if (!user) return;

      typingUsers.delete(socket.id);
      
      const roomTypingUsers = Array.from(typingUsers.values());
      io.to(user.currentRoom).emit('typing_users', roomTypingUsers);
    } catch (error) {
      console.error('Typing stop error:', error);
    }
  });

  // Handle room operations
  socket.on('join_room', (roomName) => {
    try {
      const user = users.get(socket.id);
      if (!user) return;

      const sanitizedRoomName = roomName.trim().toLowerCase();
      console.log('🎯 Join room:', sanitizedRoomName);

      // Leave current room
      if (user.currentRoom && user.currentRoom !== sanitizedRoomName) {
        socket.leave(user.currentRoom);
        rooms.get(user.currentRoom)?.delete(socket.id);
        
        // Notify old room
        socket.to(user.currentRoom).emit('user_left_room', {
          username: user.username,
          room: user.currentRoom,
          message: `${user.username} left ${user.currentRoom}`,
          timestamp: new Date().toISOString()
        });
      }

      // Create room if needed
      if (!rooms.has(sanitizedRoomName)) {
        rooms.set(sanitizedRoomName, new Set());
        messages.set(sanitizedRoomName, []);
        console.log(`✅ New room created: ${sanitizedRoomName}`);
      }
      
      // Join new room
      rooms.get(sanitizedRoomName).add(socket.id);
      socket.join(sanitizedRoomName);
      user.currentRoom = sanitizedRoomName;

      // Send room messages to user
      socket.emit('room_messages', messages.get(sanitizedRoomName) || []);
      
      // Notify new room
      socket.to(sanitizedRoomName).emit('user_joined_room', {
        username: user.username,
        room: sanitizedRoomName,
        message: `${user.username} joined ${sanitizedRoomName}`,
        timestamp: new Date().toISOString()
      });

      // Update room list for all clients
      io.emit('room_list', getRoomList());
      
      console.log(`✅ ${user.username} joined ${sanitizedRoomName}`);
    } catch (error) {
      console.error('Room join error:', error);
    }
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    try {
      const fromUser = users.get(socket.id);
      const toUser = Array.from(users.values()).find(u => u.username === to);
      
      if (!fromUser || !toUser) return;

      const privateMessage = {
        id: Date.now(),
        from: fromUser.username,
        to: toUser.username,
        message: message,
        timestamp: new Date().toISOString(),
        type: 'private'
      };

      // Send to both users
      socket.emit('private_message', privateMessage);
      socket.to(toUser.id).emit('private_message', privateMessage);
      
      console.log(`🔒 Private: ${fromUser.username} → ${toUser.username}`);
    } catch (error) {
      console.error('Private message error:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    try {
      const user = users.get(socket.id);
      if (user) {
        console.log(`❌ ${user.username} disconnected: ${reason}`);
        user.online = false;
        typingUsers.delete(socket.id);
        
        // Notify users
        io.emit('user_list', getOnlineUsers());
        
        // Clean up after delay
        setTimeout(() => {
          if (!socket.connected) {
            users.delete(socket.id);
          }
        }, 5000);
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  });

  // Get available rooms
  socket.on('get_rooms', () => {
    try {
      socket.emit('room_list', getRoomList());
    } catch (error) {
      console.error('Get rooms error:', error);
    }
  });
});

// API routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    users: getOnlineUsers().length,
    rooms: rooms.size,
    message: 'Chat server is running'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'HTTP server is working!' });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Socket.io Chat Server',
    status: 'running'
  });
});

// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ WebSocket server ready`);
  console.log(`🌐 Client: http://localhost:5173`);
});

export { app, server, io };