// App.jsx - Main application component
import { useState, useEffect } from 'react';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';
import useSocket from './hooks/useSocket';
import './App.css';

function App() {
  const [username, setUsername] = useState(null);
  const {
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
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    startTyping,
    stopTyping,
    joinRoom,
    getRooms,
    markNotificationsAsRead
  } = useSocket();

  const handleLogin = (newUsername) => {
    setUsername(newUsername);
    connect(newUsername);
  };

  const handleLogout = () => {
    disconnect();
    setUsername(null);
  };

  // Auto-reconnect logic
  useEffect(() => {
    if (username && !isConnected && !isAuthenticated) {
      const timeout = setTimeout(() => {
        connect(username);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [username, isConnected, isAuthenticated, connect]);

  return (
    <div className="app">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <ChatRoom
          messages={messages}
          users={users}
          typingUsers={typingUsers}
          rooms={rooms}
          currentRoom={currentRoom}
          notifications={notifications}
          unreadCount={unreadCount}
          messagesEndRef={messagesEndRef}
          sendMessage={sendMessage}
          sendPrivateMessage={sendPrivateMessage}
          startTyping={startTyping}
          stopTyping={stopTyping}
          joinRoom={joinRoom}
          getRooms={getRooms}
          markNotificationsAsRead={markNotificationsAsRead}
          currentUser={currentUser}
          isConnected={isConnected}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;