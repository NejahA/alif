import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2, Mic, Play, Circle, Square } from 'lucide-react';
import masterBus from '../audio/masterBus';

export default function Looper() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasBuffer, setHasBuffer] = useState(false);
  const [volume, setVolume] = useState(-5);
  
  const micRef = useRef(null);
  const recorderRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    return () => {
      micRef.current?.dispose();
      recorderRef.current?.dispose();
      playerRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (playerRef.current) {
        playerRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  const toggleRecord = async () => {
    await Tone.start();
    if (isRecording) {
      // Stop recording
      const recording = await recorderRef.current.stop();
      setIsRecording(false);
      
      const url = URL.createObjectURL(recording);
      if (playerRef.current) playerRef.current.dispose();
      
      playerRef.current = new Tone.Player(url).connect(masterBus);
      playerRef.current.loop = true;
      
      // Wait for buffer to load
      await Tone.loaded();
      setHasBuffer(true);
      
      // Auto play after record
      playerRef.current.start();
      setIsPlaying(true);
      
      // Close mic
      micRef.current?.close();
    } else {
      // Start recording
      micRef.current = new Tone.UserMedia();
      recorderRef.current = new Tone.Recorder();
      
      try {
          await micRef.current.open();
          micRef.current.connect(recorderRef.current);
          recorderRef.current.start();
          setIsRecording(true);
          
          if (isPlaying && playerRef.current) {
              playerRef.current.stop();
              setIsPlaying(false);
          }
      } catch (e) {
          alert("Microphone access is required to use the Looper.");
      }
    }
  };

  const togglePlay = async () => {
    await Tone.start();
    if (!hasBuffer || !playerRef.current) return;
    
    if (isPlaying) {
        playerRef.current.stop();
        setIsPlaying(false);
    } else {
        playerRef.current.start();
        setIsPlaying(true);
    }
  };

  const clearLoop = () => {
      if (playerRef.current) {
          playerRef.current.stop();
          playerRef.current.dispose();
          playerRef.current = null;
      }
      setIsPlaying(false);
      setHasBuffer(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', width: '100%', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Volume2 size={14} /> Loop Volume
          </label>
          <input 
            type="range" min="-30" max="0" step="1" 
            value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      <div style={{ 
          background: '#dc2626', padding: '30px', borderRadius: '20px', 
          border: '5px solid #991b1b', display: 'flex', gap: '30px', alignItems: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
      }}>
          
        {/* Record Pedal */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: isRecording ? '#fff' : '#450a0a', boxShadow: isRecording ? '0 0 10px #fff' : 'none' }} />
            <button 
                onClick={toggleRecord}
                style={{ 
                    width: '100px', height: '150px', background: '#d4d4d8', 
                    border: '5px solid #a1a1aa', borderRadius: '10px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', boxShadow: '0 10px 0 #71717a',
                    transform: isRecording ? 'translateY(10px)' : 'none'
                }}
            >
                <Mic size={32} color="#111" />
                <span style={{ color: '#111', fontWeight: 'bold', marginTop: '10px' }}>REC/DUB</span>
            </button>
        </div>

        {/* Play/Stop Pedal */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: isPlaying ? '#22c55e' : '#450a0a', boxShadow: isPlaying ? '0 0 10px #22c55e' : 'none' }} />
            <button 
                onClick={togglePlay}
                disabled={!hasBuffer}
                style={{ 
                    width: '100px', height: '150px', background: '#d4d4d8', 
                    border: '5px solid #a1a1aa', borderRadius: '10px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: hasBuffer ? 'pointer' : 'not-allowed', opacity: hasBuffer ? 1 : 0.5,
                    boxShadow: '0 10px 0 #71717a',
                    transform: isPlaying ? 'translateY(10px)' : 'none'
                }}
            >
                {isPlaying ? <Square size={32} color="#111" /> : <Play size={32} color="#111" />}
                <span style={{ color: '#111', fontWeight: 'bold', marginTop: '10px' }}>PLAY/STOP</span>
            </button>
        </div>
        
      </div>

      {hasBuffer && (
          <button 
              onClick={clearLoop}
              style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '5px', cursor: 'pointer' }}
          >
              Clear Loop Memory
          </button>
      )}
      
      <p style={{ color: 'var(--text-muted)' }}>Click REC to start recording from your mic. Click again to stop and auto-play the loop.</p>
    </div>
  );
}
