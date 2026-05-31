import React, { useState } from 'react';
import { Play, Square, Plus, Volume2 } from 'lucide-react';

// A mock DAW-style Multi-Track Arranger
export default function MultiTrackArranger() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0); // 0 to 100%
  
  const [tracks, setTracks] = useState([
    { id: 1, name: 'Drums', color: '#ef4444', blocks: [{ start: 0, width: 20 }, { start: 30, width: 20 }] },
    { id: 2, name: 'Bass', color: '#3b82f6', blocks: [{ start: 0, width: 40 }] },
    { id: 3, name: 'Synth', color: '#10b981', blocks: [{ start: 20, width: 30 }, { start: 60, width: 20 }] },
    { id: 4, name: 'Vocals', color: '#a855f7', blocks: [{ start: 40, width: 40 }] }
  ]);

  React.useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayhead(p => {
          if (p >= 100) return 0; // Loop back
          return p + 0.5;
        });
      }, 50); // Speed of playhead
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const stop = () => {
    setIsPlaying(false);
    setPlayhead(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Top Bar Controls */}
      <div style={{ display: 'flex', gap: '15px', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', alignItems: 'center' }}>
        <button className={`btn-glass ${isPlaying ? 'active' : ''}`} onClick={togglePlay}>
          <Play size={18} />
        </button>
        <button className="btn-glass" onClick={stop}>
          <Square size={18} />
        </button>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'monospace' }}>
          00:00:{(Math.floor(playhead) / 10).toFixed(1).padStart(4, '0')}
        </div>
      </div>

      {/* The Timeline */}
      <div style={{ 
        position: 'relative', background: '#18181b', borderRadius: '10px', 
        border: '1px solid #3f3f46', overflow: 'hidden', padding: '10px 0'
      }}>
        {/* Playhead */}
        <div style={{ 
          position: 'absolute', top: 0, bottom: 0, left: `calc(150px + ${playhead}%)`, 
          width: '2px', background: 'var(--accent-primary)', zIndex: 10,
          boxShadow: '0 0 10px var(--accent-primary)'
        }} />

        {/* Tracks */}
        {tracks.map(track => (
          <div key={track.id} style={{ display: 'flex', height: '60px', borderBottom: '1px solid #27272a' }}>
            {/* Track Header */}
            <div style={{ 
              width: '150px', padding: '10px', background: '#27272a', 
              display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '5px',
              borderRight: '1px solid #3f3f46'
            }}>
              <div style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>{track.name}</div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button style={{ background: '#3f3f46', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '10px', padding: '2px 5px', cursor: 'pointer' }}>M</button>
                <button style={{ background: '#3f3f46', color: '#fff', border: 'none', borderRadius: '3px', fontSize: '10px', padding: '2px 5px', cursor: 'pointer' }}>S</button>
              </div>
            </div>

            {/* Track Content Area */}
            <div style={{ flex: 1, position: 'relative', background: 'rgba(255,255,255,0.02)', margin: '5px 10px', borderRadius: '5px' }}>
              {/* Grid Lines */}
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ position: 'absolute', left: `${i * 10}%`, top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.05)' }} />
              ))}

              {/* Audio Blocks */}
              {track.blocks.map((block, i) => (
                <div key={i} style={{ 
                  position: 'absolute', left: `${block.start}%`, width: `${block.width}%`, 
                  top: '5px', bottom: '5px', background: track.color, opacity: 0.8,
                  borderRadius: '3px', border: `1px solid rgba(255,255,255,0.5)`,
                  cursor: 'pointer'
                }} />
              ))}
            </div>
          </div>
        ))}
        
        <button style={{ 
          margin: '10px 10px 0 10px', padding: '10px', background: 'rgba(255,255,255,0.05)',
          border: '1px dashed #555', color: '#888', width: 'calc(100% - 20px)', borderRadius: '5px',
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', cursor: 'pointer'
        }}>
          <Plus size={16} /> Add Track
        </button>
      </div>

      <p style={{ color: 'var(--text-muted)' }}>This is a visual arrangement layout for sequencing tracks (currently non-functional audio placeholder).</p>
    </div>
  );
}
