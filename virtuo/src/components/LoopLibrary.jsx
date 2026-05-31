import React, { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Square, Search, Clock, Filter, Volume2, Disc, Heart, Download, Grid3X3, List } from 'lucide-react';

const PRESET_LOOPS = [
  { id: 'l1', name: 'Four on Floor', category: 'drums', bpm: 128, duration: '4 bars', icon: '🥁', color: '#ef4444' },
  { id: 'l2', name: 'Trap Hat Roll', category: 'drums', bpm: 140, duration: '2 bars', icon: '🔊', color: '#ef4444' },
  { id: 'l3', name: 'Deep Sub Bass', category: 'bass', bpm: 120, duration: '2 bars', icon: '🎸', color: '#f59e0b' },
  { id: 'l4', name: 'Acoustic Groove', category: 'drums', bpm: 100, duration: '4 bars', icon: '🥁', color: '#ef4444' },
  { id: 'l5', name: 'Ambient Pad Cmaj', category: 'pads', bpm: 80, duration: '8 bars', icon: '🌌', color: '#8b5cf6' },
  { id: 'l6', name: 'Funky Guitar Riff', category: 'guitar', bpm: 110, duration: '2 bars', icon: '🎸', color: '#22c55e' },
  { id: 'l7', name: 'Analog Synth Lead', category: 'synth', bpm: 130, duration: '4 bars', icon: '🎹', color: '#3b82f6' },
  { id: 'l8', name: 'House Piano Chord', category: 'keys', bpm: 126, duration: '2 bars', icon: '🎹', color: '#3b82f6' },
  { id: 'l9', name: '808 Bass Drop', category: 'bass', bpm: 140, duration: '1 bar', icon: '🎸', color: '#f59e0b' },
  { id: 'l10', name: 'Lo-Fi Vinyl Crackle', category: 'fx', bpm: 90, duration: '4 bars', icon: '📀', color: '#ec4899' },
  { id: 'l11', name: 'Shaker Loop', category: 'percussion', bpm: 120, duration: '2 bars', icon: '🔔', color: '#14b8a6' },
  { id: 'l12', name: 'String Swell', category: 'orchestral', bpm: 70, duration: '8 bars', icon: '🎻', color: '#a855f7' }
];

const CATEGORIES = ['all', 'drums', 'bass', 'pads', 'synth', 'keys', 'guitar', 'percussion', 'orchestral', 'fx'];

export default function LoopLibrary() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState([]);
  const playerRef = useRef(null);

  const filteredLoops = PRESET_LOOPS.filter(loop => {
    if (activeCategory !== 'all' && loop.category !== activeCategory) return false;
    if (searchQuery && !loop.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const playLoop = async (loop) => {
    await Tone.start();
    if (playingId === loop.id) {
      playerRef.current?.stop();
      playerRef.current?.dispose();
      playerRef.current = null;
      setPlayingId(null);
      return;
    }
    playerRef.current?.dispose();
    playerRef.current = new Tone.Player().toDestination();
    playerRef.current.volume.value = -6;
    const synth = new Tone.Synth().toDestination();
    const freq = loop.category === 'bass' ? 65.41 :
                 loop.category === 'pads' ? 261.63 :
                 loop.category === 'drums' ? 200 : 440;
    synth.triggerAttackRelease(freq, '2n');
    Tone.Transport.bpm.value = loop.bpm;
    setPlayingId(loop.id);
    setTimeout(() => {
      synth.dispose();
    }, 2000);
  };

  const stopAll = () => {
    playerRef.current?.dispose();
    playerRef.current = null;
    setPlayingId(null);
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  useEffect(() => {
    return () => {
      playerRef.current?.dispose();
    };
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
        <Disc size={18} color="var(--accent-primary)" />
        <h3 style={{ margin: 0, fontSize: '1rem', flex: 1 }}>Loop Library</h3>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => setViewMode('grid')} style={{ padding: '4px', borderRadius: '4px', border: `1px solid ${viewMode === 'grid' ? 'var(--accent-primary)' : 'var(--glass-border)'}`, background: 'transparent', cursor: 'pointer', color: viewMode === 'grid' ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
            <Grid3X3 size={12} />
          </button>
          <button onClick={() => setViewMode('list')} style={{ padding: '4px', borderRadius: '4px', border: `1px solid ${viewMode === 'list' ? 'var(--accent-primary)' : 'var(--glass-border)'}`, background: 'transparent', cursor: 'pointer', color: viewMode === 'list' ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
            <List size={12} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <Search size={12} opacity={0.4} />
          <input
            type="text" placeholder="Search loops..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '0.7rem', outline: 'none', width: '100%' }}
          />
        </div>
        {playingId && (
          <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={stopAll}
            style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Square size={10} /> Stop
          </motion.button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '5px' }} className="no-scrollbar">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '4px 12px',
              borderRadius: '12px',
              border: 'none',
              background: activeCategory === cat ? 'var(--accent-primary)' : 'rgba(255,255,255,0.08)',
              color: activeCategory === cat ? 'white' : 'var(--text-muted)',
              fontSize: '0.65rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              textTransform: 'capitalize'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: viewMode === 'grid' ? 'grid' : 'flex', gridTemplateColumns: '1fr 1fr', flexDirection: viewMode === 'list' ? 'column' : undefined, gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
        <AnimatePresence>
          {filteredLoops.map(loop => (
            <motion.div
              key={loop.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                padding: '10px',
                background: playingId === loop.id ? `${loop.color}20` : 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                border: `1px solid ${playingId === loop.id ? loop.color : 'var(--glass-border)'}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s ease'
              }}
              onClick={() => playLoop(loop)}
            >
              <div style={{ fontSize: '1.3rem', width: '30px', textAlign: 'center' }}>{loop.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: playingId === loop.id ? loop.color : 'var(--text-main)' }}>{loop.name}</div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={8} /> {loop.bpm} BPM</span>
                  <span>{loop.duration}</span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(loop.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: favorites.includes(loop.id) ? '#ef4444' : 'rgba(255,255,255,0.2)' }}
              >
                <Heart size={12} fill={favorites.includes(loop.id) ? '#ef4444' : 'none'} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div style={{ fontSize: '0.6rem', opacity: 0.4, textAlign: 'center' }}>
        {filteredLoops.length} loops • Click to preview with synth demo
      </div>
    </div>
  );
}
