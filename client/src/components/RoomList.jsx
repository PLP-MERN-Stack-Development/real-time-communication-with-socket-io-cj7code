// RoomList.jsx - Component to display and manage chat rooms
// RoomList.jsx - Fixed with proper text colors throughout
import { useState } from 'react';

const RoomList = ({ rooms, currentRoom, onJoinRoom }) => {
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreateRoom = (e) => {
    e.preventDefault();
    const roomName = newRoomName.trim();
    if (roomName && !rooms.find(room => room.name === roomName)) {
      onJoinRoom(roomName);
      setNewRoomName('');
    }
  };

  const defaultRooms = ['general', 'random', 'tech', 'gaming'];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Chat Rooms</h3>
        
        {/* Create Room Form - FIXED INPUT */}
        <form onSubmit={handleCreateRoom} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Create new room..."
            maxLength={20}
            pattern="[a-zA-Z0-9-_]+"
            title="Room name can only contain letters, numbers, hyphens, and underscores"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 bg-white placeholder-gray-500" // Added text-gray-800, bg-white, and placeholder-gray-500
          />
          <button 
            type="submit" 
            disabled={!newRoomName.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
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
                <span className="font-medium"># {room.name}</span>
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