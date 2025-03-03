import React from 'react';
import { MessageSquare } from 'lucide-react';
import type { Channel } from '../../types';

interface ChannelListProps {
  channels: Channel[];
  currentChannelId?: string;
  onSelectChannel: (channel: Channel) => void;
}

const ChannelList: React.FC<ChannelListProps> = ({ 
  channels, 
  currentChannelId, 
  onSelectChannel 
}) => {
  return (
    <ul className="space-y-1 py-2">
      {channels.map((channel) => (
        <li key={channel.id}>
          <button
            onClick={() => onSelectChannel(channel)}
            className={`w-full flex items-center px-4 py-2 text-sm ${
              channel.id === currentChannelId
                ? 'bg-indigo-100 text-indigo-900'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="truncate"># {channel.name}</span>
          </button>
        </li>
      ))}
      {channels.length === 0 && (
        <li className="px-4 py-2 text-sm text-gray-500">
          No channels available
        </li>
      )}
    </ul>
  );
};

export default ChannelList;