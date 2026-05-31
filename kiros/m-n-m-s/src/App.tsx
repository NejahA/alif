import React, { useState, useRef, useEffect } from 'react';
import CustomTitleBar from './components/CustomTitleBar';
import PlayerControls from './components/PlayerControls';
import Visualizer from './components/Visualizer';
import Library from './components/Library';
import { motion, AnimatePresence } from 'framer-motion';
import { Disc } from 'lucide-react';

const MOCK_TRACKS = [
  {
    id: '1',
    title: 'Neon Nights',
    artist: 'M&M Digital',
    duration: '3:45',
    cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: '2',
    title: 'Cyber Pulse',
    artist: 'Electra',
    duration: '4:20',
    cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&h=400&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: '3',
    title: 'Retro Wave',
    artist: 'Synth Master',
    duration: '2:55',
    cover: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=400&h=400&fit=crop',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  }
];

function App() {
  const [tracks, setTracks] = useState(MOCK_TRACKS);
  const [currentTrack, setCurrentTrack] = useState(MOCK_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState<'none' | 'all' | 'one'>('all');
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(e => console.error("Playback failed:", e));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrack]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleTrackSelect = (track: any) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handleRegisterFolder = async () => {
    try {
      const newTracks = await (window as any).ipcRenderer.invoke('select-folder');
      if (newTracks && newTracks.length > 0) {
        setTracks(prev => [...prev, ...newTracks]);
        // Auto-play the first new track
        setCurrentTrack(newTracks[0]);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Failed to import folder:', error);
    }
  };

  const handlePrev = () => {
    if (isShuffle) {
      const remainingTracks = tracks.filter(t => t.id !== currentTrack.id);
      if (remainingTracks.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingTracks.length);
        handleTrackSelect(remainingTracks[randomIndex]);
      } else {
        handleTrackSelect(currentTrack);
      }
    } else {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
      const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
      handleTrackSelect(tracks[prevIndex]);
    }
  };

  const handleNext = () => {
    if (isRepeat === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);

    if (isShuffle) {
      const remainingTracks = tracks.filter(t => t.id !== currentTrack.id);
      if (remainingTracks.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingTracks.length);
        handleTrackSelect(remainingTracks[randomIndex]);
      } else {
        handleTrackSelect(currentTrack);
      }
    } else {
      if (isRepeat === 'none' && currentIndex === tracks.length - 1) {
        setIsPlaying(false);
        if (audioRef.current) audioRef.current.currentTime = 0;
        return;
      }
      const nextIndex = (currentIndex + 1) % tracks.length;
      handleTrackSelect(tracks[nextIndex]);
    }
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => {
    const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
    const currentIndex = modes.indexOf(isRepeat);
    const nextIndex = (currentIndex + 1) % modes.length;
    setIsRepeat(modes[nextIndex]);
  };

  return (
    <div id="app-root" className="w-full h-screen flex flex-col overflow-hidden text-white bg-black/40 backdrop-blur-3xl relative">
      <div id="title-bar">
        <CustomTitleBar />
      </div>
      
      <div id="main-layout" className="flex-1 flex overflow-hidden">
        <div id="side-bar">
          <Library 
            tracks={tracks} 
            currentTrackId={currentTrack.id} 
            onTrackSelect={handleTrackSelect}
            onAddFolder={handleRegisterFolder}
          />
        </div>

        <main id="content-area" className="flex-1 flex flex-col relative">
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 15, repeat: Infinity }}
              className="absolute -top-1/2 -right-1/2 w-full h-full bg-pink-500/20 blur-[120px] rounded-full"
            />
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, -90, 0],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-yellow-500/10 blur-[120px] rounded-full"
            />
          </div>

          {/* Track Info & Visualizer */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-12 z-10">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentTrack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="relative group">
                  <motion.div 
                    animate={isPlaying ? { rotate: 360 } : {}}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-64 h-64 rounded-full border-8 border-white/5 overflow-hidden shadow-2xl relative"
                  >
                    <img src={currentTrack.cover} alt={currentTrack.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-black rounded-full border-4 border-white/10" />
                    </div>
                  </motion.div>
                  <div className="absolute -bottom-4 -right-4 p-4 glass rounded-2xl">
                    <Disc className={`text-pink-500 ${isPlaying ? 'animate-spin-slow' : ''}`} />
                  </div>
                </div>

                <div className="text-center">
                  <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-pink-500 to-yellow-500 bg-clip-text text-transparent uppercase tracking-tight">
                    {currentTrack.title}
                  </h1>
                  <p className="text-lg opacity-40 font-medium">{currentTrack.artist}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <Visualizer 
              audioElement={audioRef.current} 
              isPlaying={isPlaying} 
            />
          </div>

          <audio 
            ref={audioRef}
            src={currentTrack.url}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleNext}
          />

          <PlayerControls 
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrev={handlePrev}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            onVolumeChange={(e) => setVolume(parseFloat(e.target.value))}
            onSeek={handleSeek}
            isShuffle={isShuffle}
            isRepeat={isRepeat}
            onToggleShuffle={toggleShuffle}
            onToggleRepeat={toggleRepeat}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
