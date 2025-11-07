// MessageList.jsx - Component to display chat messages
// MessageList.jsx - Using Tailwind CSS only
const MessageList = ({ messages, typingUsers, currentUser, messagesEndRef }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMessage = (message) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return message.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {messages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4 opacity-50">💬</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-600">No messages yet</h3>
          <p className="text-gray-500">Be the first to start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          // In MessageList.jsx, updated the message styling for private messages:
          <div
            key={message.id}
            className={`mb-4 p-4 rounded-2xl max-w-[70%] animate-fade-in ${
              message.senderId === currentUser?.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto shadow-lg'
                : message.system
                ? 'bg-gray-100 text-gray-600 text-center max-w-full italic px-6 py-3 rounded-full'
                : message.isPrivate
                ? 'bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-pink-300 text-gray-800 shadow-md' // Fixed text color for private messages
                : 'bg-white text-gray-800 shadow-sm border border-gray-200' // Regular messages
            }`}
          >
            {!message.system && (
              <div className="flex justify-between items-center mb-2">
                <span className={`text-sm font-semibold ${
                  message.senderId === currentUser?.id ? 'text-white/90' : 'text-gray-700'
                }`}>
                  {message.sender || message.from}
                  {message.isPrivate && ' 🔒'}
                </span>
                <span className={`text-xs opacity-70 ${
                  message.senderId === currentUser?.id ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </span>
              </div>
            )}
            
            <div className={`${message.system ? 'italic' : ''}`}>
              {message.system ? (
                <em>{message.message}</em>
              ) : (
                formatMessage(message.message)
              )}
            </div>
          </div>
        ))
      )}

      {/* Typing Indicators */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 p-3 text-gray-500 italic">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <span className="text-sm">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;