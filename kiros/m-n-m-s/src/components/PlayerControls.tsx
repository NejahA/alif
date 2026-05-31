import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentTime: number;
  duration: number;
  volume: number;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isShuffle: boolean;
  isRepeat: 'none' | 'all' | 'one';
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  currentTime,
  duration,
  volume,
  onVolumeChange,
  onSeek,
  isShuffle,
  isRepeat,
  onToggleShuffle,
  onToggleRepeat
}) => {
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getRepeatIcon = () => {
    if (isRepeat === 'one') return <div className="relative"><Repeat size={18} /><span className="absolute -top-1 -right-1 text-[8px] font-bold bg-pink-500 rounded-full w-3 h-3 flex items-center justify-center">1</span></div>;
    return <Repeat size={18} />;
  };

  return (
    <div id="player-bar" className="glass rounded-t-3xl p-4 flex flex-col gap-2 relative z-10">
      {/* Progress Bar */}
      <div className="flex items-center gap-2 group">
        <span className="text-[10px] tabular-nums opacity-60 w-8">{formatTime(currentTime)}</span>
        <input 
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={onSeek}
          className="flex-1 accent-pink-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer hover:h-2 transition-all"
        />
        <span className="text-[10px] tabular-nums opacity-60 w-8">{formatTime(duration)}</span>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 w-1/3">
          <button 
            onClick={onToggleShuffle}
            className={`p-2 transition-colors bg-transparent border-none ${
              isShuffle ? 'text-pink-500 opacity-100' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <Shuffle size={18} />
          </button>
          <button 
            onClick={onToggleRepeat}
            className={`p-2 transition-colors bg-transparent border-none ${
              isRepeat !== 'none' ? 'text-pink-500 opacity-100' : 'opacity-60 hover:opacity-100'
            }`}
          >
            {getRepeatIcon()}
          </button>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={onPrev} className="p-2 hover:text-pink-500 bg-transparent border-none transition-transform hover:scale-110">
            <SkipBack size={24} fill="currentColor" />
          </button>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={onPlayPause}
            className="w-14 h-14 bg-gradient-to-br from-pink-500 to-yellow-500 rounded-full flex items-center justify-center border-none shadow-lg shadow-pink-500/20"
          >
            {isPlaying ? <Pause size={28} fill="white" color="white" /> : <Play size={28} fill="white" color="white" className="ml-1" />}
          </motion.button>

          <button onClick={onNext} className="p-2 hover:text-pink-500 bg-transparent border-none transition-transform hover:scale-110">
            <SkipForward size={24} fill="currentColor" />
          </button>
        </div>

        <div className="flex items-center gap-3 w-1/3 justify-end group">
          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            <input 
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={onVolumeChange}
              className="w-24 accent-yellow-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
