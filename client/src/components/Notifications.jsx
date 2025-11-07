// Notifications.jsx - Professional styling
const Notifications = ({ notifications, isVisible, onClose }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_message':
        return '💬';
      case 'private_message':
        return '🔒';
      case 'user_joined':
        return '👋';
      case 'user_left':
        return '🚪';
      case 'user_joined_room':
        return '🎯';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_message':
        return 'border-blue-500 bg-blue-50';
      case 'private_message':
        return 'border-purple-500 bg-purple-50';
      case 'user_joined':
        return 'border-green-500 bg-green-50';
      case 'user_left':
        return 'border-orange-500 bg-orange-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 right-0 w-96 h-full bg-white shadow-2xl border-l border-gray-200 z-50 animate-slide-in-right">
      {/* Professional Header */}
      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-lg">🔔</span>
          </div>
          <div>
            <h3 className="text-lg font-bold">Notifications</h3>
            <p className="text-white/80 text-sm">{notifications.length} total</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-xl hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <span className="text-xl font-bold">×</span>
        </button>
      </div>
      
      {/* Notifications List */}
      <div className="h-full overflow-y-auto bg-gray-50/50">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🔔</span>
            </div>
            <p className="text-lg font-semibold mb-2">No notifications</p>
            <p className="text-sm text-gray-400">Notifications will appear here</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex gap-4 p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md hover:transform hover:scale-[1.02] ${
                  notification.read 
                    ? 'bg-white/70 opacity-60' 
                    : 'bg-white shadow-sm'
                } ${getNotificationColor(notification.type)}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                  notification.read ? 'bg-gray-200' : 'bg-white shadow-sm'
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm mb-1 leading-tight">
                    {notification.title}
                  </div>
                  <div className="text-gray-600 text-sm mb-2 leading-relaxed">
                    {notification.message}
                  </div>
                  <div className="text-gray-400 text-xs font-medium">
                    {formatTime(notification.timestamp)}
                  </div>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;