// RoomList.jsx - Enhanced with better room creation feedback
import { useState } from 'react';

const RoomList = ({ rooms, currentRoom, onJoinRoom }) => {
  const [newRoomName, setNewRoomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    const roomName = newRoomName.trim();
    
    if (!roomName) return;
    
    // Basic validation
    if (roomName.length < 2 || roomName.length > 20) {
      alert('Room name must be between 2 and 20 characters');
      return;
    }
    
    if (!/^[a-zA-Z0-9-_ ]+$/.test(roomName)) {
      alert('Room name can only contain letters, numbers, spaces, hyphens, and underscores');
      return;
    }
    
    if (rooms.find(room => room.name.toLowerCase() === roomName.toLowerCase())) {
      alert('Room already exists');
      return;
    }

    setIsCreating(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      onJoinRoom(roomName);
      setNewRoomName('');
      setIsCreating(false);
    }, 300);
  };

  const defaultRooms = ['general', 'random', 'tech', 'gaming'];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Chat Rooms</h3>
        
        {/* Create Room Form */}
        <form onSubmit={handleCreateRoom} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Create new room..."
              maxLength={20}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white placeholder-gray-500"
              disabled={isCreating}
            />
            <button 
              type="submit" 
              disabled={!newRoomName.trim() || isCreating}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? '...' : '+'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Room names: 2-20 characters, letters, numbers, spaces, hyphens, underscores
          </p>
        </form>

        {/* Default Rooms */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Quick Join</h4>
          <div className="space-y-2">
            {defaultRooms.map(room => (
              <button
                key={room}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                  currentRoom === room
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-800'
                }`}
                onClick={() => onJoinRoom(room)}
              >
                # {room}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Available Rooms */}
      <div className="flex-1">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Available Rooms ({rooms.length})
        </h4>
        {rooms.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-sm">No rooms available</p>
            <p className="text-xs text-gray-400 mt-1">Create a room to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rooms.map(room => (
              <div
                key={room.name}
                className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  currentRoom === room.name
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg'
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-800'
                }`}
                onClick={() => onJoinRoom(room.name)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium"># {room.name}</span>
                  {!defaultRooms.includes(room.name) && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">New</span>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  currentRoom === room.name
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {room.userCount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomList;