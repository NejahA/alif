import React, { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';
import { Circle, Play, Square, RefreshCcw, Volume2, Layers, Trash2, Plus } from 'lucide-react';
import masterBus from '../audio/masterBus';
import { useAudioSafe } from '../hooks/useAudioSafe';

export default function MultiTrackLooper() {
  const isAudioReady = useAudioSafe();
  const [tracks, setTracks] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTrackId, setRecordingTrackId] = useState(null);
  
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (!isAudioReady) return;
    // Record from Tone.Destination
    const dest = Tone.context.createMediaStreamDestination();
    Tone.Destination.connect(dest);
    recorderRef.current = new MediaRecorder(dest.stream);

    recorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorderRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      
      const newTrack = {
        id: Date.now(),
        url: url,
        player: new Tone.Player(url).toDestination(),
        volume: 0,
        isMuted: false,
        name: `Track ${tracks.length + 1}`
      };
      
      newTrack.player.loop = true;
      setTracks(prev => [...prev, newTrack]);
      chunksRef.current = [];
    };

    return () => {
      recorderRef.current?.stop();
      tracks.forEach(t => t.player.dispose());
    };
  }, []);

  const startRecording = async () => {
    await Tone.start();
    chunksRef.current = [];
    recorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current.stop();
    setIsRecording(false);
  };

  const toggleTrack = (id) => {
    setTracks(prev => prev.map(t => {
      if (t.id === id) {
        if (t.player.state === 'started') {
          t.player.stop();
        } else {
          t.player.start();
        }
      }
      return t;
    }));
  };

  const deleteTrack = (id) => {
    setTracks(prev => {
      const track = prev.find(t => t.id === id);
      track?.player.dispose();
      return prev.filter(t => t.id !== id);
    });
  };

  const updateVolume = (id, vol) => {
    setTracks(prev => prev.map(t => {
      if (t.id === id) {
        t.player.volume.value = vol;
        return { ...t, volume: vol };
      }
      return t;
    }));
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={24} color="var(--accent-primary)" />
          <h3 style={{ margin: 0 }}>Multi-track Looper</h3>
        </div>
        
        <button 
          className={`btn-glass ${isRecording ? 'active' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          style={{ background: isRecording ? '#dc2626' : undefined, borderColor: isRecording ? '#ef4444' : undefined, padding: '10px 25px' }}
        >
          {isRecording ? <Square size={18} /> : <Circle size={18} fill="currentColor" />}
          {isRecording ? 'Stop Recording' : 'New Layer'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
        <AnimatePresence>
          {tracks.map(track => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-panel"
              style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{track.name}</span>
                <button onClick={() => deleteTrack(track.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                  <Trash2 size={14} />
                </button>
              </div>

              <button 
                className={`btn-glass ${track.player.state === 'started' ? 'active' : ''}`}
                onClick={() => toggleTrack(track.id)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {track.player.state === 'started' ? <Square size={14} /> : <Play size={14} />}
                {track.player.state === 'started' ? 'Stop' : 'Play'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Volume2 size={14} color="var(--text-muted)" />
                <input 
                  type="range" min="-60" max="6" step="1" 
                  value={track.volume} 
                  onChange={(e) => updateVolume(track.id, Number(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {tracks.length === 0 && !isRecording && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No tracks yet. Click "New Layer" to record your first loop!
          </div>
        )}
      </div>
    </div>
  );
}
