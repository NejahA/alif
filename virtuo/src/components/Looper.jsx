import React, { useState, useRef, useEffect } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Circle, Play, Square, RefreshCcw, Volume2 } from 'lucide-react';

export default function Looper() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [hasLoop, setHasLoop] = useState(false);
  const [volume, setVolume] = useState(0); // dB
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isOverdubbing, setIsOverdubbing] = useState(false);

  const recorderRef = useRef(null);
  const playerRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    const dest = Tone.context.createMediaStreamDestination();
    Tone.Destination.connect(dest);
    recorderRef.current = new MediaRecorder(dest.stream);

    recorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorderRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      
      if (playerRef.current && !isOverdubbing) {
        playerRef.current.dispose();
      }
      
      const newPlayer = new Tone.Player(url, () => {
        setHasLoop(true);
      }).toDestination();
      
      newPlayer.loop = true;
      newPlayer.playbackRate = playbackRate;
      newPlayer.volume.value = volume;

      if (isOverdubbing && playerRef.current) {
        // Simple overdub simulation: keep previous player and start new one
        // In a real app, we would bounce them together
        newPlayer.start();
      } else {
        playerRef.current = newPlayer;
      }

      chunksRef.current = [];
    };

    return () => {
      recorderRef.current?.stop();
      playerRef.current?.dispose();
    };
  }, [playbackRate, volume, isOverdubbing]);

  const toggleRecord = async () => {
    await Tone.start();
    if (isRecording) {
      recorderRef.current.stop();
      setIsRecording(false);
      setIsOverdubbing(false);
    } else {
      if (isLooping && !isOverdubbing) toggleLoop();
      chunksRef.current = [];
      recorderRef.current.start();
      setIsRecording(true);
      setHasLoop(false);
    }
  };

  const startOverdub = async () => {
    if (!hasLoop) return;
    setIsOverdubbing(true);
    setIsRecording(true);
    chunksRef.current = [];
    recorderRef.current.start();
  };

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const toggleLoop = () => {
    if (!playerRef.current || !hasLoop) return;
    
    if (isLooping) {
      playerRef.current.stop();
      setIsLooping(false);
    } else {
      playerRef.current.start();
      setIsLooping(true);
    }
  };

  const clearLoop = () => {
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.dispose();
      playerRef.current = null;
    }
    setHasLoop(false);
    setIsLooping(false);
  };

  return (
    <div className="glass-panel" style={{ padding: '20px', width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Loop Station</h3>
        {isRecording && (
          <motion.div 
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}
          />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button 
          className={`btn-glass ${isRecording && !isOverdubbing ? 'active' : ''}`}
          onClick={toggleRecord}
          style={{ background: isRecording && !isOverdubbing ? '#dc2626' : undefined, borderColor: isRecording && !isOverdubbing ? '#ef4444' : undefined }}
        >
          {isRecording && !isOverdubbing ? <Square size={16} /> : <Circle size={16} fill="currentColor" />}
          {isRecording && !isOverdubbing ? 'Stop' : 'Rec'}
        </button>

        <button 
          className={`btn-glass ${isOverdubbing ? 'active' : ''}`}
          onClick={startOverdub}
          disabled={!hasLoop || isRecording}
          style={{ 
            opacity: (!hasLoop || isRecording) ? 0.5 : 1,
            background: isOverdubbing ? '#ea580c' : undefined,
            borderColor: isOverdubbing ? '#f97316' : undefined
          }}
        >
          <RefreshCcw size={16} /> Overdub
        </button>

        <button 
          className={`btn-glass ${isLooping ? 'active' : ''}`}
          onClick={toggleLoop}
          disabled={!hasLoop || (isRecording && !isOverdubbing)}
          style={{ opacity: (!hasLoop || (isRecording && !isOverdubbing)) ? 0.5 : 1 }}
        >
          {isLooping ? <Square size={16} /> : <Play size={16} />}
          {isLooping ? 'Stop' : 'Play'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0 8px' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Speed</span>
          <select 
            value={playbackRate} 
            onChange={(e) => setPlaybackRate(Number(e.target.value))}
            style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.75rem', outline: 'none', cursor: 'pointer' }}
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Volume2 size={16} color="var(--text-muted)" />
        <input 
          type="range" 
          min="-60" 
          max="10" 
          value={volume} 
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
        />
      </div>

      <button 
        className="btn-glass" 
        onClick={clearLoop} 
        disabled={!hasLoop}
        style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', opacity: !hasLoop ? 0.5 : 1 }}
      >
        <RefreshCcw size={14} /> Clear Loop
      </button>
      
      <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Capture your performance and jam along!
      </p>
    </div>
  );
}
