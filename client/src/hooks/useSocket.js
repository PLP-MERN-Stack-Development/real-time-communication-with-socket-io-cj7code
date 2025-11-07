// useSocket.js - Enhanced custom hook for Socket.io functionality
import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance with enhanced configuration
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket', 'polling']
});

// Custom hook for using socket.io with enhanced features
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
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator
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
      setMessages([]); // Clear messages when joining new room
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
    
    // Play notification sound
    playNotificationSound();
    
    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification(notification.title || 'New Message', {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {
      // Silent fail if audio can't play
    });
  }, []);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
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
      setIsConnected(true);
      console.log('Connected to server');
    };

    const onDisconnect = (reason) => {
      setIsConnected(false);
      console.log('Disconnected from server:', reason);
    };

    // Message events
    const onReceiveMessage = (message) => {
      setMessages(prev => [...prev, message]);
      
      // Add notification if message is not from current user and not in current room
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
      setMessages(prev => [...prev, message]);
      
      // Add notification for private messages
      if (message.from !== currentUser?.username) {
        addNotification({
          type: 'private_message',
          title: `Private message from ${message.from}`,
          message: message.message
        });
      }
    };

    const onRoomMessages = (roomMessages) => {
      setMessages(roomMessages);
    };

    // User events
    const onUserList = (userList) => {
      setUsers(userList);
    };

    const onUserJoined = (data) => {
      addNotification({
        type: 'user_joined',
        title: 'User Joined',
        message: data.message
      });
    };

    const onUserLeft = (data) => {
      addNotification({
        type: 'user_left',
        title: 'User Left',
        message: data.message
      });
    };

    const onUserJoinedRoom = (data) => {
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
      setRooms(roomList);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('room_messages', onRoomMessages);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('user_joined_room', onUserJoinedRoom);
    socket.on('typing_users', onTypingUsers);
    socket.on('room_list', onRoomList);

    // Request notification permission on mount
    requestNotificationPermission();

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('room_messages', onRoomMessages);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('user_joined_room', onUserJoinedRoom);
      socket.off('typing_users', onTypingUsers);
      socket.off('room_list', onRoomList);
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [addNotification, currentRoom, currentUser, requestNotificationPermission]);

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
    requestNotificationPermission,
    scrollToBottom
  };
};

export default useSocket;