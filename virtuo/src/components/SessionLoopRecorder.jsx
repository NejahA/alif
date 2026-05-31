import React, { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, StopCircle, Play, Square, Trash2, Layers, Volume2, Music } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function SessionLoopRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [loops, setLoops] = useState([]);
  const [activeTrack, setActiveTrack] = useState(0);
  const recorderRef = useRef(null);
  const playersRef = useRef([]);

  useEffect(() => {
    recorderRef.current = new Tone.Recorder();
    masterBus.connect(recorderRef.current);

    return () => {
      recorderRef.current?.dispose();
      playersRef.current.forEach(p => p.dispose());
    };
  }, []);

  const startRecording = async () => {
    await Tone.start();
    recorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    const blob = await recorderRef.current.stop();
    const url = URL.createObjectURL(blob);
    const player = new Tone.Player(url).toDestination();
    player.loop = true;
    
    const newLoop = {
      id: Date.now(),
      url,
      player,
      name: `Loop ${loops.length + 1}`,
      volume: 0,
      isMuted: false
    };

    setLoops(prev => [...prev, newLoop]);
    playersRef.current.push(player);
    setIsRecording(false);
  };

  const toggleLoop = (id) => {
    const loop = loops.find(l => l.id === id);
    if (loop.player.state === 'started') {
      loop.player.stop();
    } else {
      loop.player.start();
    }
    setLoops([...loops]);
  };

  const deleteLoop = (id) => {
    const loop = loops.find(l => l.id === id);
    loop.player.dispose();
    setLoops(prev => prev.filter(l => l.id !== id));
  };

  const updateVolume = (id, vol) => {
    const loop = loops.find(l => l.id === id);
    loop.volume = vol;
    loop.player.volume.value = vol;
    setLoops([...loops]);
  };

  return (
    <div className="glass-panel" style={{ padding: '25px', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Layers size={20} color="var(--accent-primary)" />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Session Looper</h3>
        </div>
        {!isRecording ? (
          <button className="btn-glass" onClick={startRecording} style={{ color: '#ef4444' }}>
            <Mic size={16} /> Record Loop
          </button>
        ) : (
          <button className="btn-glass active" onClick={stopRecording} style={{ background: '#ef4444' }}>
            <StopCircle size={16} /> Stop & Add
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loops.map((loop, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={loop.id} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px', 
              background: 'rgba(255,255,255,0.05)', 
              padding: '12px 15px', 
              borderRadius: '10px',
              border: '1px solid var(--glass-border)'
            }}
          >
            <button 
              className={`btn-glass ${loop.player.state === 'started' ? 'active' : ''}`}
              onClick={() => toggleLoop(loop.id)}
              style={{ padding: '8px' }}
            >
              {loop.player.state === 'started' ? <Square size={14} /> : <Play size={14} />}
            </button>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{loop.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Volume2 size={12} opacity={0.5} />
                <input 
                  type="range" min="-60" max="6" step="1" 
                  value={loop.volume} 
                  onChange={(e) => updateVolume(loop.id, Number(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--accent-primary)', height: '4px' }}
                />
              </div>
            </div>

            <button className="btn-glass" onClick={() => deleteLoop(loop.id)} style={{ color: '#ef4444', padding: '8px' }}>
              <Trash2 size={14} />
            </button>
          </motion.div>
        ))}
        {loops.length === 0 && (
          <div style={{ padding: '30px', textAlign: 'center', opacity: 0.3, fontSize: '0.9rem', border: '1px dashed var(--glass-border)', borderRadius: '12px' }}>
            No loops recorded yet. Hit record to start layering!
          </div>
        )}
      </div>

      <div style={{ fontSize: '0.7rem', opacity: 0.4, textAlign: 'center' }}>
        Loops are synced to the master output. Great for building textures live.
      </div>
    </div>
  );
}
