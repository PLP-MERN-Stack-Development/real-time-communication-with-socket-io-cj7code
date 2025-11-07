// ChatRoom.jsx - Professional styling with click-outside close
import { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from './UserList';
import RoomList from './RoomList';
import Notifications from './Notifications';

const ChatRoom = ({ 
  messages, 
  users, 
  typingUsers, 
  rooms, 
  currentRoom, 
  notifications,
  unreadCount,
  messagesEndRef,
  sendMessage,
  sendPrivateMessage,
  startTyping,
  stopTyping,
  joinRoom,
  getRooms,
  markNotificationsAsRead,
  currentUser,
  isConnected 
}) => {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  
  // Ref for click-outside detection
  const notificationsRef = useRef(null);

  useEffect(() => {
    getRooms();
  }, [getRooms]);

  useEffect(() => {
    if (showNotifications) {
      markNotificationsAsRead();
    }
  }, [showNotifications, markNotificationsAsRead]);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && 
          notificationsRef.current && 
          !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Header - Professional Styling */}
      <header className="flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">💬</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Socket.io Chat</h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-500 font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
            #{currentRoom}
          </div>
          <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
            {users.length} online
          </div>
        </div>
        
        {/* Professional Button Group */}
        <div className="flex gap-3">
          {/* Notifications Button */}
          <button 
            className={`
              relative p-3 rounded-xl transition-all duration-200 group
              ${showNotifications 
                ? 'bg-blue-500 text-white shadow-lg transform scale-105' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
              }
            `}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <div className="flex items-center gap-2">
              <span className={`text-lg transition-transform ${showNotifications ? 'scale-110' : 'group-hover:scale-110'}`}>
                🔔
              </span>
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Sidebar Toggle Button */}
          <button 
            className={`
              relative p-3 rounded-xl transition-all duration-200 group flex items-center gap-2
              ${showSidebar 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
              }
            `}
            onClick={toggleSidebar}
          >
            <span className={`text-lg transition-transform ${showSidebar ? 'scale-110' : 'group-hover:scale-110'}`}>
              👥
            </span>
            <span className="text-sm font-semibold hidden sm:block">
              {showSidebar ? 'Hide' : 'Show'}
            </span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <aside className="w-80 bg-white border-r border-gray-100 flex flex-col shadow-lg">
            <div className="flex border-b border-gray-100 bg-white">
              <button 
                className={`flex-1 py-4 font-semibold transition-all duration-200 ${
                  activeTab === 'chat' 
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('chat')}
              >
                Rooms
              </button>
              <button 
                className={`flex-1 py-4 font-semibold transition-all duration-200 ${
                  activeTab === 'users' 
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('users')}
              >
                Users ({users.length})
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'chat' ? (
                <RoomList
                  rooms={rooms}
                  currentRoom={currentRoom}
                  onJoinRoom={joinRoom}
                />
              ) : (
                <UserList
                  users={users}
                  currentUser={currentUser}
                  onSendPrivateMessage={sendPrivateMessage}
                />
              )}
            </div>
          </aside>
        )}

        {/* Main Chat Area */}
        <main className={`flex-1 flex flex-col bg-white ${!showSidebar ? 'w-full' : ''}`}>
          <MessageList
            messages={messages}
            typingUsers={typingUsers}
            currentUser={currentUser}
            messagesEndRef={messagesEndRef}
          />
          
          <MessageInput
            onSendMessage={sendMessage}
            onStartTyping={startTyping}
            onStopTyping={stopTyping}
            disabled={!isConnected}
          />
        </main>

        {/* Notifications Panel with Click-Outside */}
        <div ref={notificationsRef}>
          <Notifications
            notifications={notifications}
            isVisible={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;