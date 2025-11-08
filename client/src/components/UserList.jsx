// UserList.jsx -
import { useState } from 'react';

const UserList = ({ users, currentUser, onSendPrivateMessage }) => {
  const [privateMessage, setPrivateMessage] = useState({});
  const [activeUser, setActiveUser] = useState(null);

  const handlePrivateMessage = (username) => {
    const message = privateMessage[username]?.trim();
    if (message) {
      onSendPrivateMessage(username, message);
      setPrivateMessage(prev => ({ ...prev, [username]: '' }));
      setActiveUser(null);
    }
  };

  return (
    <div className="h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Online Users ({users.length})</h3>
      
      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No users online</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className={`p-4 rounded-xl border transition-all ${
                user.id === currentUser?.id 
                  ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-sm' 
                  : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800 block">
                      {user.username}
                    </span>
                    {user.id === currentUser?.id && (
                      <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                  {user.id !== currentUser?.id && (
                    <button
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                      onClick={() => setActiveUser(activeUser === user.username ? null : user.username)}
                      title="Send private message"
                    >
                      <span className="text-lg">💬</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Private Message Input - LARGER Single-line Input */}
              {activeUser === user.username && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 animate-slide-down">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">🔒</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Private message to {user.username}</span>
                  </div>
                  
                  {/* ENLARGED Single-line Input with Icon Send Button */}
                  <div className="flex gap-2 items-stretch">
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={privateMessage[user.username] || ''}
                        onChange={(e) => setPrivateMessage(prev => ({
                          ...prev,
                          [user.username]: e.target.value
                        }))}
                        placeholder={`Type your private message to ${user.username}...`}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handlePrivateMessage(user.username);
                          }
                        }}
                        className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 bg-white placeholder-gray-500 shadow-sm"
                        autoFocus
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setActiveUser(null)}
                        className="p-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
                        title="Cancel"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handlePrivateMessage(user.username)}
                        disabled={!privateMessage[user.username]?.trim()}
                        className="p-3 rounded-xl transition-all duration-200 border border-gray-300 bg-white/80 backdrop-blur-sm hover:border-gray-400 hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group flex-1"
                        title="Send private message"
                      >
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          className={`transition-transform ${
                            !privateMessage[user.username]?.trim()
                              ? 'text-gray-400' 
                              : 'text-gray-600 group-hover:text-blue-600 group-hover:scale-110'
                          }`}
                        >
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-3 text-center border-t border-blue-100 pt-2">
                    🔒 Private conversation • Press Enter to send
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;