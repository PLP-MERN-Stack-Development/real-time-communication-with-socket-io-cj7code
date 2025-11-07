// Login.jsx - Using Tailwind only
import { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && !isLoading) {
      setIsLoading(true);
      setTimeout(() => {
        onLogin(username.trim());
        setIsLoading(false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">💬 Socket.io Chat</h1>
          <p className="text-gray-600">Join the conversation in real-time</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Choose a username
            </label>
            <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-800 bg-white" // Added text-gray-800 and bg-white
                required
                minLength={2}
                maxLength={20}
                disabled={isLoading}
                autoFocus
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={!username.trim() || isLoading}
            >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </>
            ) : (
              'Join Chat'
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Features:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ Real-time messaging</li>
            <li>✅ Multiple rooms</li>
            <li>✅ Private messages</li>
            <li>✅ Typing indicators</li>
            <li>✅ Online users</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;