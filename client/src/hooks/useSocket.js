// useSocket.js
import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

// Socket.io connection URL
const SOCKET_URL = 'http://localhost:5000';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling']
});

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Connect to socket server with authentication
  const connect = useCallback((username) => {
    socket.connect();
    socket.emit('user_join', { username });
    setCurrentUser({ username, id: socket.id });
    setIsAuthenticated(true);
  }, []);

  // Disconnect from socket server
  const disconnect = useCallback(() => {
    socket.disconnect();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMessages([]);
    setUsers([]);
  }, []);

  // Send a message
  const sendMessage = useCallback((message) => {
    if (message.trim() && isAuthenticated) {
      socket.emit('send_message', { message });
      return true;
    }
    return false;
  }, [isAuthenticated]);

  // Send a private message
  const sendPrivateMessage = useCallback((to, message) => {
    if (message.trim() && isAuthenticated) {
      socket.emit('private_message', { to, message });
      return true;
    }
    return false;
  }, [isAuthenticated]);

  // Handle typing indicators
  const startTyping = useCallback(() => {
    if (isAuthenticated) {
      socket.emit('typing_start');
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, 3000);
    }
  }, [isAuthenticated]);

  const stopTyping = useCallback(() => {
    if (isAuthenticated) {
      socket.emit('typing_stop');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  }, [isAuthenticated]);

  // Join a room
  const joinRoom = useCallback((roomName) => {
    if (isAuthenticated) {
      socket.emit('join_room', roomName);
      setCurrentRoom(roomName);
      setMessages([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Get available rooms
  const getRooms = useCallback(() => {
    socket.emit('get_rooms');
  }, []);

  // Add notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
    setUnreadCount(prev => prev + 1);
  }, []);

  // Mark notifications as read
  const markNotificationsAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      console.log('✅ Connected to server');
      setIsConnected(true);
    };

    const onDisconnect = (reason) => {
      console.log('❌ Disconnected from server:', reason);
      setIsConnected(false);
    };

    const onConnected = (data) => {
      console.log('✅ Server connection confirmed:', data);
    };

    // Message events
    const onReceiveMessage = (message) => {
      console.log('📨 Received message:', message);
      setMessages(prev => [...prev, message]);
      
      if (message.senderId !== socket.id && message.room !== currentRoom) {
        addNotification({
          type: 'new_message',
          title: `New message from ${message.sender}`,
          message: message.message,
          room: message.room
        });
      }
    };

    const onPrivateMessage = (message) => {
      console.log('🔒 Received private message:', message);
      setMessages(prev => [...prev, message]);
      
      if (message.from !== currentUser?.username) {
        addNotification({
          type: 'private_message',
          title: `Private message from ${message.from}`,
          message: message.message
        });
      }
    };

    const onRoomMessages = (roomMessages) => {
      console.log('📂 Received room messages:', roomMessages.length);
      setMessages(roomMessages);
    };

    // User events
    const onUserList = (userList) => {
      console.log('👥 User list updated:', userList.length);
      setUsers(userList);
    };

    const onUserJoined = (data) => {
      console.log('👋 User joined:', data.username);
      addNotification({
        type: 'user_joined',
        title: 'User Joined',
        message: data.message
      });
    };

    const onUserLeft = (data) => {
      console.log('👋 User left:', data.username);
      addNotification({
        type: 'user_left',
        title: 'User Left',
        message: data.message
      });
    };

    const onUserJoinedRoom = (data) => {
      console.log('🚪 User joined room:', data.username, data.room);
      addNotification({
        type: 'user_joined_room',
        title: 'Room Update',
        message: data.message
      });
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    // Room events
    const onRoomList = (roomList) => {
      console.log('🏠 Room list updated:', roomList.length);
      setRooms(roomList);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connected', onConnected);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('room_messages', onRoomMessages);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('user_joined_room', onUserJoinedRoom);
    socket.on('typing_users', onTypingUsers);
    socket.on('room_list', onRoomList);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connected', onConnected);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('room_messages', onRoomMessages);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('user_joined_room', onUserJoinedRoom);
      socket.off('typing_users', onTypingUsers);
      socket.off('room_list', onRoomList);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [addNotification, currentRoom, currentUser]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return {
    // State
    socket,
    isConnected,
    isAuthenticated,
    currentUser,
    messages,
    users,
    typingUsers,
    rooms,
    currentRoom,
    notifications,
    unreadCount,
    messagesEndRef,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    startTyping,
    stopTyping,
    joinRoom,
    getRooms,
    markNotificationsAsRead,
    scrollToBottom
  };
};

export default useSocket;