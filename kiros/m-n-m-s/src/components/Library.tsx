import React from 'react';
import { Music, Play, ListMusic, Heart, Search, Plus } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  cover: string;
}

interface LibraryProps {
  tracks: Track[];
  currentTrackId: string | null;
  onTrackSelect: (track: Track) => void;
  onAddFolder: () => void;
}

const Library: React.FC<LibraryProps> = ({ tracks, currentTrackId, onTrackSelect, onAddFolder }) => {
  return (
    <div className="w-80 h-full border-r border-white/5 flex flex-col p-4 gap-6 bg-black/20">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold uppercase tracking-widest opacity-40">Library</h2>
          <Search size={16} className="opacity-40 cursor-pointer hover:opacity-100" />
        </div>
        
        <div className="flex flex-col gap-1">
          <button className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors justify-start border-none">
            <ListMusic size={20} className="text-pink-500" />
            <span className="text-sm font-medium">All Tracks</span>
          </button>
          <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors justify-start border-none opacity-60 hover:opacity-100 bg-transparent">
            <Heart size={20} />
            <span className="text-sm font-medium">Favorites</span>
          </button>
          <button 
            onClick={onAddFolder}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors justify-start border-none opacity-60 hover:opacity-100 bg-transparent"
          >
            <Plus size={20} className="text-yellow-500" />
            <span className="text-sm font-medium">Add Folder</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 overflow-hidden">
        <h2 className="text-sm font-bold uppercase tracking-widest opacity-40 mb-2">Recent Tracks</h2>
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2">
          {tracks.map((track) => (
            <div 
              key={track.id}
              onClick={() => onTrackSelect(track)}
              className={`group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                currentTrackId === track.id ? 'bg-pink-500/10' : 'hover:bg-white/5'
              }`}
            >
              <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                  currentTrackId === track.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <Play size={16} fill="white" color="white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${
                  currentTrackId === track.id ? 'text-pink-400' : 'text-white'
                }`}>{track.title}</p>
                <p className="text-xs opacity-40 truncate">{track.artist}</p>
              </div>
              <span className="text-[10px] opacity-40 tabular-nums">{track.duration}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 glass rounded-2xl flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center">
          <Music size={20} color="white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">M&M Premium</p>
          <p className="text-xs opacity-40 italic">Coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Library;
