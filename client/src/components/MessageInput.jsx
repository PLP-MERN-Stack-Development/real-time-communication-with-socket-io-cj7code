// MessageInput.jsx - Component for sending messages
// MessageInput.jsx - Using Tailwind CSS only
import { useState, useRef, useEffect } from 'react';

const MessageInput = ({ onSendMessage, onStartTyping, onStopTyping, disabled }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      if (isTyping) {
        setIsTyping(false);
        onStopTyping();
      }
    }
  };

  const handleInputChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    if (newMessage.trim() && !isTyping) {
      setIsTyping(true);
      onStartTyping();
    } else if (!newMessage.trim() && isTyping) {
      setIsTyping(false);
      onStopTyping();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  useEffect(() => {
    return () => {
      if (isTyping) {
        onStopTyping();
      }
    };
  }, [isTyping, onStopTyping]);

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-200">
      <div className="flex gap-2 items-center">
        // In MessageInput.jsx, update the input:
        <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Connecting..." : "Type a message..."}
            disabled={disabled}
            maxLength={500}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 bg-white" // Added text-gray-800 and bg-white
        />
        
        <button 
          type="submit" 
          disabled={!message.trim() || disabled}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
      
      <div className="text-center text-gray-400 text-xs mt-2">
        Press Enter to send • Shift+Enter for new line
      </div>
    </form>
  );
};

export default MessageInput;